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

function buildPrompt(pageText: string, url: string, bankName: string): string {
    return `You are a credit card data extraction assistant.

Given the text content of a bank's credit card page, extract the card details.

REQUIRED JSON structure:
{
  "name": "Full Official Card Name",
  "bankName": "${bankName}",
  "cardType": "premium" | "regular" | "entry" | "cobrand",
  "description": "One-line summary of the card's value proposition",
  "benefits": [
    {
      "category": "Category (e.g. Shopping, Dining, Amazon, Swiggy, Travel, Fuel, Groceries, Online Shopping, Entertainment, Utilities, General)",
      "type": "cashback" | "reward_points",
      "value": <number: percentage value or multiplier>,
      "description": "Optional detail about the benefit"
    }
  ],
  "feesAndCharges": {
    "annual": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
    "joining": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
    "cashWithdrawal": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
    "forex": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" },
    "fuelTransaction": { "value": <number>, "type": "fixed" | "percentage", "description": "optional" }
  },
  "link": "${url}"
}

RULES:
- Return ONLY valid JSON, no markdown fences, no extra text.
- cardType: use "cobrand" for co-branded cards (e.g., Amazon Pay ICICI, Flipkart Axis).
  Use "premium" for high-fee cards (annual > ₹2000). Use "entry" for secured/basic cards.
  Use "regular" for everything else.
- For fees, value should be the numeric amount (e.g., 500 for ₹500 annual fee).
- For benefits, always include a "General" category for base reward rate.
- If a value cannot be determined from the page, use 0 for fees and 1 for general reward rate.

PAGE TEXT:
${pageText}`;
}

async function extractCard(
    genAI: GoogleGenerativeAI,
    pageText: string,
    url: string,
    bankName: string,
): Promise<CardJson | null> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildPrompt(pageText, url, bankName);

    const result = await retryWithBackoff(
        () => model.generateContent(prompt),
        `AI extraction for ${bankName} card`,
    );
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('  ✗ Failed to extract JSON from AI response');
        return null;
    }

    try {
        const parsed = JSON.parse(jsonMatch[0]) as CardJson;
        if (!parsed.name || !parsed.benefits || !parsed.feesAndCharges) {
            console.error('  ✗ AI response missing required fields');
            return null;
        }
        parsed.link = url;
        parsed.bankName = bankName;
        parsed.updatedAt = today;
        parsed.dataSource = 'scraped';
        return parsed;
    } catch {
        console.error('  ✗ Failed to parse AI JSON response');
        return null;
    }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
    const urls = process.argv.slice(2).filter((arg) => arg.startsWith('http'));

    if (urls.length === 0) {
        console.error('Usage: npx tsx scripts/add-card.ts <url1> [url2] ...');
        console.error('Example: npx tsx scripts/add-card.ts https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card');
        process.exit(1);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY environment variable is required.');
        console.error('Set it in .env or run: GEMINI_API_KEY=<key> npx tsx scripts/add-card.ts <url>');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log(`\n🆕 Add Card — ${urls.length} URL(s)`);
    console.log(`   Date: ${today}\n`);

    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const url of urls) {
        console.log(`\n🔗 ${url}`);

        // Detect bank from URL
        const bank = detectBank(url);
        if (!bank) {
            console.error('  ✗ Could not detect bank from URL. Supported domains:');
            for (const [pattern, slug] of BANK_URL_PATTERNS) {
                console.error(`    ${slug}: ${pattern}`);
            }
            failed++;
            continue;
        }
        console.log(`  🏦 Detected: ${bank.bankName} (${bank.slug})`);

        // Check if card already exists
        const existingCards = readBankCards(bank.slug);
        const alreadyExists = existingCards.some(
            (c) => c.link === url || c.link.replace(/\/$/, '') === url.replace(/\/$/, ''),
        );
        if (alreadyExists) {
            console.log('  ⏭ Card with this URL already exists, skipping');
            skipped++;
            continue;
        }

        // Fetch page
        console.log('  📄 Fetching page...');
        let pageText: string;
        try {
            pageText = await fetchPageText(url);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ✗ Failed to fetch page: ${msg}`);
            failed++;
            continue;
        }

        if (pageText.length < 200) {
            console.error('  ✗ Page text too short — page may require JS or may be blocked');
            failed++;
            continue;
        }
        console.log(`  Got ${pageText.length} chars`);

        // Extract via AI
        console.log('  🤖 Extracting card data via Gemini...');
        const card = await extractCard(genAI, pageText, url, bank.bankName);
        if (!card) {
            failed++;
            continue;
        }

        console.log(`  ✓ Extracted: ${card.name}`);
        console.log(`    Type: ${card.cardType}`);
        console.log(`    Annual fee: ₹${card.feesAndCharges.annual.value}`);
        console.log(`    Benefits: ${card.benefits.map((b) => `${b.category} ${b.value}%`).join(', ')}`);

        // Add to bank file
        existingCards.push(card);
        writeBankCards(bank.slug, existingCards);
        console.log(`  ✅ Added to ${BANK_FILES[bank.slug]}`);
        added++;

        if (urls.indexOf(url) < urls.length - 1) {
            await sleep(SCRAPE_DELAY_MS);
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
