#!/usr/bin/env tsx
/**
 * Add Card — Given one or more credit card page URLs, scrapes the page,
 * extracts structured data via Gemini AI, and adds the card to the appropriate
 * bank JSON file.
 *
 * Usage:
 *   npx tsx scripts/add-card.ts <url1> [url2] [url3] ...
 *   npm run add:card -- <url>
 *
 * Examples:
 *   npx tsx scripts/add-card.ts https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card
 *   npx tsx scripts/add-card.ts https://www.axisbank.com/retail/cards/credit-card/ace-credit-card https://www.icicibank.com/personal-banking/cards/credit-card/coral
 *
 * Env:
 *   GEMINI_API_KEY  — required
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    GEMINI_MODEL,
    PAGE_TIMEOUT_MS,
    SCRAPE_DELAY_MS,
    CARDS_DIR,
    BANK_FILES,
    BANK_URL_PATTERNS,
    retryWithBackoff,
} from './scrape-config.js';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CardJson {
    name: string;
    bankName: string;
    cardType: string;
    description?: string;
    benefits: {
        category: string;
        type: string;
        value: number;
        description?: string;
    }[];
    perks?: {
        category: string;
        title: string;
        description?: string;
    }[];
    feesAndCharges: {
        annual: { value: number; type: string; description?: string };
        joining: { value: number; type: string; description?: string };
        cashWithdrawal: { value: number; type: string; description?: string };
        forex: { value: number; type: string; description?: string };
        fuelTransaction?: { value: number; type: string; description?: string };
        [key: string]: unknown;
    };
    link: string;
    updatedAt?: string;
    dataSource?: 'manual' | 'scraped';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname, '..');
const cardsDir = path.join(ROOT, CARDS_DIR);
const today = new Date().toISOString().slice(0, 10);

function detectBank(url: string): { slug: string; bankName: string } | null {
    for (const [pattern, slug, bankName] of BANK_URL_PATTERNS) {
        if (pattern.test(url)) return { slug, bankName };
    }
    return null;
}

function readBankCards(bankSlug: string): CardJson[] {
    const file = BANK_FILES[bankSlug];
    if (!file) return [];
    const filePath = path.join(cardsDir, file);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeBankCards(bankSlug: string, cards: CardJson[]) {
    const file = BANK_FILES[bankSlug];
    if (!file) {
        // Create a new file for unknown banks
        const newFile = `${bankSlug}.json`;
        BANK_FILES[bankSlug] = newFile;
    }
    const filePath = path.join(cardsDir, BANK_FILES[bankSlug]);
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Page fetching ──────────────────────────────────────────────────────────────

async function fetchPageText(url: string): Promise<string> {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
        await page.waitForTimeout(3000);
        const text = await page.evaluate(() => {
            document.querySelectorAll('script, style, noscript, svg, iframe').forEach((el) => el.remove());
            return document.body?.innerText ?? '';
        });
        return text.slice(0, 15_000);
    } finally {
        await browser.close();
    }
}

// ── AI extraction ──────────────────────────────────────────────────────────────

interface PageData {
    url: string;
    bankName: string;
    text: string;
}

function buildBatchPrompt(pages: PageData[]): string {
    return `You are a credit card data extraction assistant.

Given the text contents of multiple bank credit card pages, extract the card details for each page.
Return a valid JSON **array** of objects, where each object has the exact structure below.

REQUIRED JSON structure for each card:
[
  {
    "name": "Full Official Card Name",
    "bankName": "Bank Name from the metadata provided below",
    "cardType": "premium" | "regular" | "entry" | "cobrand",
    "description": "One-line summary of the card's value proposition",
    "benefits": [
      {
        "category": "Category (e.g. Shopping, Dining, Amazon, Swiggy, Travel, Fuel, Groceries, Online Shopping, Entertainment, Utilities, General)",
        "type": "cashback" | "reward_points" | "miles" | "discount" | "waiver" | "rebate" | "reimbursement" | "voucher" | "fixed",
        "value": <number: percentage value or multiplier>,
        "description": "Optional detail about the benefit"
      }
    ],
    "perks": [
      {
        "category": "Category (e.g. Travel, Entertainment, Insurance, Dining, Lifestyle, General)",
        "title": "Short title (e.g. Priority Pass Lounge Access, BookMyShow BOGO)",
        "description": "Full description of the perk"
      }
    ],
    "feesAndCharges": {
      "annual": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
      "joining": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
      "cashWithdrawal": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
      "forex": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
      "fuelTransaction": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" }
    },
    "link": "URL from the metadata provided below"
  }
]

RULES:
- Return ONLY a valid JSON array of objects, no markdown fences, no extra text. The response must start with '[' and end with ']'.
- cardType: use "cobrand" for co-branded cards (e.g., Amazon Pay ICICI, Flipkart Axis).
  Use "premium" for high-fee cards (annual > ₹2000). Use "entry" for secured/basic cards.
  Use "regular" for everything else.
- For fees, value should be the numeric amount (e.g., 500 for ₹500 annual fee).
- If a value cannot be determined from the page, use 0 for fees and 1 for general reward rate.
- BENEFITS vs PERKS — this is critical:
  - "benefits" = EARNING RATES only. Things with a percentage or multiplier: cashback %, reward points per ₹100, miles per ₹100, discount %.
    Examples: "5% cashback on Amazon", "2 RP per ₹100 on dining", "1% fuel surcharge waiver"
    The "value" field must be the rate/percentage (e.g. 5 for 5%, 2 for 2x).
    Always include a "General" category for the base reward rate.
  - "perks" = FEATURES and PRIVILEGES. Things you GET, not rates you EARN:
    Examples: "Complimentary lounge access", "Priority Pass membership", "₹5000 welcome voucher",
    "BookMyShow BOGO", "Golf rounds", "Insurance cover", "Concierge service", "Membership (Swiggy One, EazyDiner)"
    The "title" should be a concise phrase (under 50 chars). Use "description" for the full detail.
  - If unsure, ask: "Does this have a meaningful percentage/rate?" → benefit. "Is this a feature you receive?" → perk.

PAGE TEXTS TO EXTRACT:
${pages.map((p, i) => `--- PAGE ${i + 1} ---
URL: ${p.url}
Bank: ${p.bankName}
TEXT:
${p.text}`).join('\n\n')}`;
}

async function extractCardsBatch(
    genAI: GoogleGenerativeAI,
    pages: PageData[],
    isMock: boolean
): Promise<CardJson[]> {
    if (pages.length === 0) return [];

    if (isMock) {
        console.log(`  🤖 MOCK MODE: Faking extraction for ${pages.length} cards...`);
        await sleep(1000); // simulate API delay
        return pages.map(p => ({
            name: `${p.bankName} Mock Card ${Math.floor(Math.random() * 1000)}`,
            bankName: p.bankName,
            cardType: 'regular',
            description: 'This is a mock card for testing batching logic.',
            benefits: [
                { category: 'General', type: 'cashback', value: 1.5, description: 'Mock cashback' }
            ],
            perks: [
                { category: 'Travel', title: 'Mock Lounge Access', description: 'Access to mock lounges' }
            ],
            feesAndCharges: {
                annual: { value: 500, type: 'fixed' },
                joining: { value: 0, type: 'fixed' },
                cashWithdrawal: { value: 2.5, type: 'percentage' },
                forex: { value: 3.5, type: 'percentage' }
            },
            link: p.url,
            updatedAt: today,
            dataSource: 'scraped'
        }));
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildBatchPrompt(pages);

    const result = await retryWithBackoff(
        () => model.generateContent(prompt),
        `AI batch extraction for ${pages.length} cards`,
    );
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        console.error('  ✗ Failed to extract JSON array from AI response');
        console.error('Response was:', text.substring(0, 500) + '...');
        return [];
    }

    try {
        const parsed = JSON.parse(jsonMatch[0]) as CardJson[];
        return parsed.map((card, i) => {
            // Validate required fields and assign proper meta
            if (!card.name || !card.benefits || !card.feesAndCharges) {
                console.error(`  ✗ AI response missing required fields for page ${i + 1}`);
            }
            // Ensure bankName and link match what we asked for
            const reqPage = pages.find(p => p.url === card.link) || pages[i];

            card.link = reqPage.url;
            card.bankName = reqPage.bankName;
            card.updatedAt = today;
            card.dataSource = 'scraped';
            return card;
        });
    } catch {
        console.error('  ✗ Failed to parse AI JSON response');
        return [];
    }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const urls = args.filter((arg) => arg.startsWith('http'));
    const isMock = args.includes('--mock');

    if (urls.length === 0) {
        console.error('Usage: npx tsx scripts/add-card.ts <url1> [url2] ... [--mock]');
        console.error('Example: npx tsx scripts/add-card.ts https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card');
        process.exit(1);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !isMock) {
        console.error('Error: GEMINI_API_KEY environment variable is required unless --mock is used.');
        console.error('Set it in .env or run: GEMINI_API_KEY=<key> npx tsx scripts/add-card.ts <url>');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');

    console.log(`\n🆕 Add Card — ${urls.length} URL(s) ${isMock ? '(MOCK MODE)' : ''}`);
    console.log(`   Date: ${today}\n`);

    let added = 0;
    let skipped = 0;
    let failed = 0;

    // 1. Fetch pages sequentially to avoid overloading domains
    const validPages: PageData[] = [];

    for (const url of urls) {
        console.log(`\n🔗 Checking: ${url}`);
        const bank = detectBank(url);
        if (!bank) {
            console.error('  ✗ Could not detect bank from URL. Skipped.');
            failed++;
            continue;
        }

        const existingCards = readBankCards(bank.slug);
        const alreadyExists = existingCards.some(
            (c) => c.link === url || c.link.replace(/\/$/, '') === url.replace(/\/$/, ''),
        );
        if (alreadyExists) {
            console.log('  ⏭ Card with this URL already exists, skipping');
            skipped++;
            continue;
        }

        console.log(`  🏦 Detected: ${bank.bankName}`);
        console.log('  📄 Fetching page content...');
        try {
            const pageText = await fetchPageText(url);
            if (pageText.length < 200) {
                console.error('  ✗ Page text too short — page may require JS or may be blocked');
                failed++;
                continue;
            }
            console.log(`     Got ${pageText.length} chars`);
            validPages.push({ url, bankName: bank.bankName, text: pageText });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ✗ Failed to fetch page: ${msg}`);
            failed++;
        }

        // Wait between pages to not trigger bot detection
        if (urls.indexOf(url) < urls.length - 1) {
            await sleep(SCRAPE_DELAY_MS);
        }
    }

    if (validPages.length === 0) {
        console.log('\n❌ No valid pages to extract info from.');
        process.exit(0);
    }

    // 2. Extract using Gemini in a single batched prompt
    console.log(`\n🤖 Extracting data for ${validPages.length} valid pages via Gemini...`);
    const extractedCards = await extractCardsBatch(genAI, validPages, isMock);

    if (extractedCards.length === 0) {
        console.log('❌ Failed to extract any card details.');
    } else {
        // 3. Save to appropriate files
        for (const card of extractedCards) {
            if (!card?.name) continue;

            const bank = detectBank(card.link);
            if (!bank) continue;

            const existingCards = readBankCards(bank.slug);
            existingCards.push(card);
            writeBankCards(bank.slug, existingCards);

            console.log(`\n  ✅ Added: ${card.name}`);
            console.log(`     Type: ${card.cardType}`);
            console.log(`     Bank File: ${BANK_FILES[bank.slug]}`);
            if (card.feesAndCharges?.annual) console.log(`     Annual fee: ₹${card.feesAndCharges.annual.value}`);
            if (card.benefits?.length) console.log(`     Benefits: ${card.benefits.map((b) => `${b.category} ${typeof b.value === 'number' ? b.value : 0}%`).join(', ')}`);
            added++;
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Done: ${added} added, ${skipped} skipped, ${failed} failed`);
    console.log('═'.repeat(50));

    if (added > 0) {
        console.log('\n💡 Next steps:');
        console.log('   1. Review the JSON file(s) for accuracy');
        console.log('   2. Commit and push: git add . && git commit -m "Add new cards"');
    }
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
