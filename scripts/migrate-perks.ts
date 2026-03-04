/**
 * Migration script: splits benefits[] into rewards (benefits[]) + perks[]
 *
 * Heuristic:
 * - value === 0  → perk (no earning rate)
 * - value >= 100 → perk (absolute ₹ amount, not a percentage)
 * - type === "other" → perk
 * - Everything else stays as a reward (benefit)
 *
 * For perks, a short title is extracted from the description.
 *
 * Usage: npx tsx scripts/migrate-perks.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OldBenefit {
    category: string;
    type: string;
    value: number;
    description?: string;
    conditions?: string;
}

interface Perk {
    category: string;
    title: string;
    description?: string;
}

interface Card {
    name: string;
    benefits: OldBenefit[];
    perks?: Perk[];
    [key: string]: unknown;
}

const CARDS_DIR = path.resolve(__dirname, '../src/data/cards');

function isPerk(b: OldBenefit): boolean {
    if (b.type === 'other') return true;
    if (b.value === 0) return true;
    if (b.value >= 100) return true;
    return false;
}

function extractTitle(b: OldBenefit): string {
    const desc = b.description || '';

    // Try to generate a concise title from the description
    if (!desc) return `${b.category} benefit`;

    // Truncate to first meaningful phrase (before comma or period), max 50 chars
    const firstPhrase = desc.split(/[.,;]/).at(0)?.trim() || desc;
    if (firstPhrase.length <= 50) return firstPhrase;
    return firstPhrase.slice(0, 47) + '...';
}

function migrateFile(filePath: string) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const cards: Card[] = JSON.parse(raw);
    let rewardsCount = 0;
    let perksCount = 0;

    for (const card of cards) {
        const rewards: OldBenefit[] = [];
        const perks: Perk[] = [];

        for (const b of card.benefits) {
            if (isPerk(b)) {
                perks.push({
                    category: b.category,
                    title: extractTitle(b),
                    ...(b.description ? { description: b.description } : {}),
                });
                perksCount++;
            } else {
                rewards.push(b);
                rewardsCount++;
            }
        }

        card.benefits = rewards;
        if (perks.length > 0) {
            card.perks = perks;
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
    const basename = path.basename(filePath);
    console.log(`  ${basename}: ${rewardsCount} rewards, ${perksCount} perks`);
    return { rewardsCount, perksCount };
}

// Main
console.log('Migrating benefits → rewards + perks...\n');
const files = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
let totalRewards = 0;
let totalPerks = 0;

for (const file of files) {
    const { rewardsCount, perksCount } = migrateFile(path.join(CARDS_DIR, file));
    totalRewards += rewardsCount;
    totalPerks += perksCount;
}

console.log(`\nDone! Total: ${totalRewards} rewards + ${totalPerks} perks = ${totalRewards + totalPerks} entries`);
