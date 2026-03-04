#!/usr/bin/env tsx
/**
 * Card Scraper — Fetches bank credit card pages, extracts structured data via
 * Gemini AI, and updates per-bank JSON files.
 *
 * Usage:
 *   npx tsx scripts/scrape-cards.ts                  # scrape all banks
 *   npx tsx scripts/scrape-cards.ts --bank=axis      # scrape one bank
 *   npx tsx scripts/scrape-cards.ts --dry-run        # print diff, don't write
 *
 * Env:
 *   GEMINI_API_KEY  — required
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Browser } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    GEMINI_MODEL,
    PAGE_TIMEOUT_MS,
    SCRAPE_DELAY_MS,
    SUSPICIOUS_CHANGE_FACTOR,
    CARDS_DIR,
    BANK_FILES,
    BATCH_SIZE,
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

interface DiffEntry {
    cardName: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
}

interface RejectionEntry {
    cardName: string;
    reason: string;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
}

// ── CLI parsing ────────────────────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    let bankFilter: string | undefined;
    let dryRun = false;
    let mock = false;

    for (const arg of args) {
        if (arg.startsWith('--bank=')) bankFilter = arg.split('=')[1];
        if (arg === '--dry-run') dryRun = true;
        if (arg === '--mock') mock = true;
    }

    return { bankFilter, dryRun, mock };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname, '..');
const cardsDir = path.join(ROOT, CARDS_DIR);
const today = new Date().toISOString().slice(0, 10);

function readBankCards(bankSlug: string): CardJson[] {
    const file = BANK_FILES[bankSlug];
    if (!file) throw new Error(`Unknown bank slug: ${bankSlug}`);
    const filePath = path.join(cardsDir, file);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeBankCards(bankSlug: string, cards: CardJson[]) {
    const file = BANK_FILES[bankSlug];
    if (!file) throw new Error(`Unknown bank slug: ${bankSlug}`);
    const filePath = path.join(cardsDir, file);
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Page fetching ──────────────────────────────────────────────────────────────

async function fetchPageText(browser: Browser, url: string): Promise<string> {
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
        // Wait a bit for JS-rendered content
        await page.waitForTimeout(3000);
        // Extract text, strip scripts/styles
        const text = await page.evaluate(() => {
            // Remove script and style elements
            document.querySelectorAll('script, style, noscript, svg, iframe').forEach((el) => el.remove());
            return document.body?.innerText ?? '';
        });
        return text.slice(0, 15_000); // Cap to ~15k chars to manage token count
    } finally {
        await page.close();
    }
}

// ── AI extraction ──────────────────────────────────────────────────────────────

interface PageData {
    cardInfo: CardJson;
    pageText: string;
}

function buildBatchExtractionPrompt(pages: PageData[]): string {
    return `You are a credit card data extraction assistant.

Given the text contents of multiple bank credit card pages, extract or update the details for each card.
Return a valid JSON **array** of objects, where each object has the exact structure below.
There should be exactly ${pages.length} items in the array, one for each card provided in the input, IN THE EXACT SAME ORDER.

REQUIRED JSON structure for each card:
[
  {
    "name": "Card Name",
    "bankName": "Bank Name",
    "cardType": "premium" | "regular" | "entry" | "cobrand",
    "description": "One-line description",
    "benefits": [
      {
        "category": "Category name (e.g. Shopping, Dining, Amazon, Swiggy, Travel, Fuel, Groceries, Online Shopping, Entertainment, Utilities, General)",
        "type": "cashback" | "reward_points" | "miles" | "discount" | "waiver" | "rebate" | "reimbursement" | "voucher" | "fixed",
        "value": <number: percentage value or multiplier>,
        "description": "Optional detail"
      }
    ],
    "perks": [
      {
        "category": "Category name (e.g. Travel, Entertainment, Insurance, Dining, Lifestyle, General)",
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
    "link": "URL"
  }
]

RULES:
- Return ONLY a valid JSON array of objects, no markdown fences, no extra text.
- If a value is not found on the page, use the existing value from the current data provided below for that card.
- For fees, the value should be the numeric amount (e.g. 500 for ₹500, or 3.5 for 3.5%).
- cardType should be one of: premium, regular, entry, cobrand.
- Keep the bankName and link exactly as provided in the fallback.
- BENEFITS vs PERKS — this is critical:
  - "benefits" = EARNING RATES only. Things with a percentage or multiplier: cashback %, reward points per ₹100, miles per ₹100, discount %.
    Examples: "5% cashback on Amazon", "2 RP per ₹100 on dining", "1% fuel surcharge waiver"
    The "value" field must be the rate/percentage (e.g. 5 for 5%, 2 for 2x).
  - "perks" = FEATURES and PRIVILEGES. Things you GET, not rates you EARN:
    Examples: "Complimentary lounge access", "Priority Pass membership", "₹5000 welcome voucher",
    "BookMyShow BOGO", "Golf rounds", "Insurance cover", "Concierge service", "Membership (Swiggy One, EazyDiner)"
    The "title" should be a concise phrase (under 50 chars). Use "description" for the full detail.
  - If unsure, ask: "Does this have a meaningful percentage/rate?" → benefit. "Is this a feature you receive?" → perk.

CURRENT CARD DATA & PAGE TEXTS (Input):
${pages.map((p, i) => `--- CARD ${i + 1}: ${p.cardInfo.name} ---
CURRENT DATA (fallback):
${JSON.stringify(p.cardInfo, null, 2)}
PAGE TEXT:
${p.pageText}`).join('\n\n')}`;
}

async function extractCardsBatchData(
    genAI: GoogleGenerativeAI,
    pages: PageData[],
    isMock: boolean
): Promise<CardJson[]> {
    if (pages.length === 0) return [];

    if (isMock) {
        console.log(`     🤖 MOCK MODE: Faking extraction for ${pages.length} cards...`);
        await sleep(1000); // simulate API delay
        return pages.map(p => ({
            ...p.cardInfo,
            description: p.cardInfo.description || 'Mock updated description',
            benefits: p.cardInfo.benefits?.length ? p.cardInfo.benefits : [{ category: 'General', type: 'cashback', value: 1 }],
            perks: p.cardInfo.perks?.length ? p.cardInfo.perks : [{ category: 'Travel', title: 'Mock Lounge Access' }]
        }));
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildBatchExtractionPrompt(pages);

    const result = await retryWithBackoff(
        () => model.generateContent(prompt),
        `AI batch extraction for ${pages.length} cards`,
    );
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        console.error('     ✗ Failed to extract JSON array from AI response');
        console.error('     Response was:', text.substring(0, 300) + '...');
        return [];
    }

    try {
        const parsed = JSON.parse(jsonMatch[0]) as CardJson[];
        return parsed.map((card, i) => {
            const original = pages[i]?.cardInfo;
            if (!card.name || !card.benefits || !card.feesAndCharges) {
                console.error(`     ✗ AI response missing required fields for "${original?.name || 'unknown'}"`);
                return original; // Fallback to original
            }
            return card;
        });
    } catch {
        console.error('     ✗ Failed to parse AI JSON for batch');
        return [];
    }
}

// ── Diff & validation ──────────────────────────────────────────────────────────

function diffCards(oldCard: CardJson, newCard: CardJson): { diffs: DiffEntry[]; rejections: RejectionEntry[] } {
    const diffs: DiffEntry[] = [];
    const rejections: RejectionEntry[] = [];

    // Compare simple fields
    for (const field of ['name', 'cardType', 'description'] as const) {
        if (oldCard[field] !== newCard[field]) {
            diffs.push({ cardName: oldCard.name, field, oldValue: oldCard[field], newValue: newCard[field] });
        }
    }

    // Compare fees — check for suspicious changes
    const feeKeys = ['annual', 'joining', 'cashWithdrawal', 'forex', 'fuelTransaction'] as const;
    for (const key of feeKeys) {
        const oldFee = oldCard.feesAndCharges?.[key];
        const newFee = newCard.feesAndCharges?.[key];
        if (!oldFee || !newFee) continue;

        const oldVal = typeof oldFee === 'object' && oldFee !== null ? (oldFee as { value: number }).value : 0;
        const newVal = typeof newFee === 'object' && newFee !== null ? (newFee as { value: number }).value : 0;

        if (oldVal !== newVal) {
            const entry = { cardName: oldCard.name, field: `feesAndCharges.${key}`, oldValue: oldVal, newValue: newVal };
            // Check for suspicious jump
            if (oldVal > 0 && newVal > 0) {
                const ratio = Math.max(newVal / oldVal, oldVal / newVal);
                if (ratio > SUSPICIOUS_CHANGE_FACTOR) {
                    rejections.push({
                        cardName: oldCard.name,
                        reason: `Suspicious fee change (${ratio.toFixed(1)}x): feesAndCharges.${key} changed from ${oldVal} to ${newVal}`,
                        field: `feesAndCharges.${key}`,
                        oldValue: oldVal,
                        newValue: newVal,
                    });
                    continue; // Don't include in diffs — rejected
                }
            }
            diffs.push(entry);
        }
    }

    // Compare benefits (simplified — check count and total values)
    const oldBenefitSummary = oldCard.benefits?.map((b) => `${b.category}:${b.value}`).sort().join(',');
    const newBenefitSummary = newCard.benefits?.map((b) => `${b.category}:${b.value}`).sort().join(',');
    if (oldBenefitSummary !== newBenefitSummary) {
        diffs.push({
            cardName: oldCard.name,
            field: 'benefits',
            oldValue: oldCard.benefits?.map((b) => `${b.category}: ${b.value}%`).join(', '),
            newValue: newCard.benefits?.map((b) => `${b.category}: ${b.value}%`).join(', '),
        });
    }

    return { diffs, rejections };
}

function applyValidChanges(oldCard: CardJson, newCard: CardJson, rejections: RejectionEntry[]): CardJson {
    const rejectedFields = new Set(rejections.map((r) => r.field).filter(Boolean));
    const merged = { ...newCard };

    // Restore rejected fee fields from old data
    for (const field of rejectedFields) {
        if (field?.startsWith('feesAndCharges.')) {
            const key = field.split('.')[1];
            (merged.feesAndCharges as Record<string, unknown>)[key] =
                (oldCard.feesAndCharges as Record<string, unknown>)[key];
        }
    }

    // Preserve link and bankName from old data (never override these)
    merged.link = oldCard.link;
    merged.bankName = oldCard.bankName;
    merged.updatedAt = today;
    merged.dataSource = 'scraped';

    return merged;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
    const { bankFilter, dryRun, mock } = parseArgs();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !mock) {
        console.error('Error: GEMINI_API_KEY environment variable is required unless --mock is used.');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');

    // Determine which banks to scrape
    const banksToScrape = bankFilter
        ? [bankFilter]
        : Object.keys(BANK_FILES);

    // Validate bank filter
    for (const bank of banksToScrape) {
        if (!BANK_FILES[bank]) {
            console.error(`Error: Unknown bank "${bank}". Available: ${Object.keys(BANK_FILES).join(', ')}`);
            process.exit(1);
        }
    }

    console.log(`\n🔍 Card Scraper — ${dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`   Banks: ${banksToScrape.join(', ')}`);
    console.log(`   Date: ${today}\n`);

    // Launch browser
    const browser = await chromium.launch({ headless: true });

    const allDiffs: DiffEntry[] = [];
    const allRejections: RejectionEntry[] = [];
    let cardsProcessed = 0;
    let cardsUpdated = 0;
    let cardsFailed = 0;

    try {
        for (const bankSlug of banksToScrape) {
            const cards = readBankCards(bankSlug);
            if (cards.length === 0) {
                console.log(`⏭  ${bankSlug}: no cards found, skipping`);
                continue;
            }

            console.log(`\n📦 ${bankSlug} (${cards.length} cards)`);
            const updatedCards: CardJson[] = [];

            for (let i = 0; i < cards.length; i += BATCH_SIZE) {
                const batchCards = cards.slice(i, i + BATCH_SIZE);
                console.log(`\n  --- Processing Batch ${i / BATCH_SIZE + 1} (${batchCards.length} cards) ---`);

                const validPages: PageData[] = [];
                for (const card of batchCards) {
                    cardsProcessed++;
                    console.log(`\n    🔗 ${card.name}`);
                    console.log(`       ${card.link}`);

                    try {
                        console.log('       Fetching page...');
                        const pageText = await fetchPageText(browser, card.link);
                        if (pageText.length < 200) {
                            console.log('       ⚠ Page text too short, skipping AI extraction');
                            updatedCards.push(card);
                            cardsFailed++;
                            continue;
                        }
                        console.log(`       Got ${pageText.length} chars of text`);
                        validPages.push({ cardInfo: card, pageText });
                    } catch (err) {
                        const errMsg = err instanceof Error ? err.message : String(err);
                        console.log(`       ✗ Error: ${errMsg}`);
                        updatedCards.push(card); // Keep existing
                        cardsFailed++;
                    }

                    if (batchCards.indexOf(card) < batchCards.length - 1) {
                        await sleep(SCRAPE_DELAY_MS);
                    }
                }

                if (validPages.length === 0) continue;

                console.log(`\n    🤖 Extracting data for ${validPages.length} active valid pages via Gemini...`);
                const extractedBatch = await extractCardsBatchData(genAI, validPages, mock);

                if (extractedBatch.length === 0) {
                    console.log('    ✗ Batch extraction failed, keeping all existing data for batch');
                    for (const { cardInfo } of validPages) {
                        updatedCards.push(cardInfo);
                        cardsFailed++;
                    }
                    continue;
                }

                // Diff & validate for each extracted card
                for (let j = 0; j < extractedBatch.length; j++) {
                    const original = validPages[j].cardInfo;
                    const extracted = extractedBatch[j];

                    const { diffs, rejections } = diffCards(original, extracted);
                    allDiffs.push(...diffs);
                    allRejections.push(...rejections);

                    if (rejections.length > 0) {
                        console.log(`      ⚠ REJECTIONS FOR ${original.name}:`);
                        for (const r of rejections) {
                            console.log(`        ✗ ${r.reason}`);
                        }
                    }

                    if (diffs.length > 0) {
                        console.log(`      📝 Changes for ${original.name}:`);
                        for (const d of diffs) {
                            console.log(`        ${d.field}: ${JSON.stringify(d.oldValue)} → ${JSON.stringify(d.newValue)}`);
                        }
                        const merged = applyValidChanges(original, extracted, rejections);
                        updatedCards.push(merged);
                        cardsUpdated++;
                    } else {
                        console.log(`      ✓ No changes detected for ${original.name}`);
                        updatedCards.push(original);
                    }
                }
            }

            // Write updated data
            if (!dryRun) {
                writeBankCards(bankSlug, updatedCards);
                console.log(`\n  ✓ Written ${bankSlug} JSON`);
            }
        }
    } finally {
        await browser.close();
    }

    // ── Summary ────────────────────────────────────────────────────────────────

    console.log('\n' + '═'.repeat(60));
    console.log('📊 SCRAPE SUMMARY');
    console.log('═'.repeat(60));
    console.log(`  Cards processed: ${cardsProcessed}`);
    console.log(`  Cards updated:   ${cardsUpdated}`);
    console.log(`  Cards failed:    ${cardsFailed}`);
    console.log(`  Total changes:   ${allDiffs.length}`);
    console.log(`  Rejections:      ${allRejections.length}`);

    if (allRejections.length > 0) {
        console.log('\n⚠ REJECTED CHANGES:');
        for (const r of allRejections) {
            console.log(`  [${r.cardName}] ${r.reason}`);
        }
    }

    if (allDiffs.length > 0) {
        console.log('\n📝 ALL CHANGES:');
        for (const d of allDiffs) {
            console.log(`  [${d.cardName}] ${d.field}: ${JSON.stringify(d.oldValue)} → ${JSON.stringify(d.newValue)}`);
        }
    }

    if (dryRun) {
        console.log('\n🏁 Dry run complete — no files were modified.');
    } else {
        console.log(`\n🏁 Done.`);
    }

    // Set output for GitHub Actions
    const hasChanges = allDiffs.length > 0;
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `cards_changed=${hasChanges}\n`);
        if (hasChanges) {
            const summary = allDiffs.map((d) => `- **${d.cardName}**: ${d.field} changed`).join('\n');
            // Multiline output for GitHub Actions
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `change_summary<<EOF\n${summary}\nEOF\n`);
        }
    }

    process.exit(0);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
