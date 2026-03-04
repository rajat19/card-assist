import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARDS_DIR = path.resolve(__dirname, '../src/data/cards');

interface Perk {
    category: string;
    title: string;
    description?: string;
}

interface Card {
    name: string;
    perks?: Perk[];
    [key: string]: unknown;
}

function generatePreciseTitle(fullText: string): string {
    const text = fullText.toLowerCase();

    // Core keyword matching for clean precise titles
    if (text.includes('welcome bonus') || text.includes('welcome benefit')) return 'Welcome Benefit';
    if (text.includes('renewal benefit') || text.includes('anniversary')) return 'Renewal Benefit';
    if (text.includes('milestone')) return 'Milestone Benefit';
    if (text.includes('priority pass')) return 'Priority Pass Membership';
    if (text.includes('international lounge')) return 'International Lounge Access';
    if (text.includes('domestic lounge') || text.includes('airport lounges in india')) return 'Domestic Lounge Access';
    if (text.includes('lounge access')) return 'Lounge Access';
    if (text.includes('bookmyshow') || text.includes('movie ticket') || text.includes('movies')) {
        if (text.includes('bogo') || text.includes('buy one get one') || text.includes('buy 1 get 1')) return 'BOGO Movie Tickets';
        return 'Movie Tickets';
    }
    if (text.includes('swiggy one')) return 'Swiggy One Membership';
    if (text.includes('eazydiner')) return 'EazyDiner Prime';
    if (text.includes('golf')) return 'Golf Privileges';
    if (text.includes('insurance')) return 'Insurance Cover';
    if (text.includes('concierge')) return 'Concierge Services';
    if (text.includes('membership') || text.includes('culinaire') || text.includes('marriott')) return 'Premium Memberships';
    if (text.includes('porter')) return 'Porter Services';
    if (text.includes('valet') || text.includes('parking')) return 'Valet/Parking Services';
    if (text.includes('pranaam')) return 'Pranaam Services';
    if (text.includes('meet and greet') || text.includes('meet & greet')) return 'Meet & Greet Services';
    if (text.includes('health') || text.includes('wellness')) return 'Health & Wellness';
    if (text.includes('fuel surcharge')) return 'Fuel Surcharge Waiver';
    if (text.includes('cashback') && text.includes('percent')) return 'Cashback';
    if (text.includes('reward points') || text.includes('points') || text.includes('bluchips')) {
        // Fallback for random point bonuses
        if (text.includes('spend')) return 'Spend Based Rewards';
        return 'Bonus Reward Points';
    }
    if (text.includes('discount')) return 'Special Discounts';
    if (text.includes('voucher') || text.includes('gift card')) return 'Gift Vouchers';

    // Fallback: take first 4 words
    const words = fullText.split(' ');
    if (words.length <= 4) return fullText;
    const short = words.slice(0, 4).join(' ').replace(/[,;.]+$/, '');
    return short.charAt(0).toUpperCase() + short.slice(1);
}

function processFiles() {
    const files = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
    let updatedPerks = 0;

    for (const file of files) {
        const filePath = path.join(CARDS_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const cards: Card[] = JSON.parse(raw);

        for (const card of cards) {
            if (!card.perks || card.perks.length === 0) continue;

            for (const perk of card.perks) {
                const fullText = perk.description || perk.title;

                // If it was artificially truncated in previous migration, use description
                if (perk.title.endsWith('...') && perk.description) {
                    // okay, fullText is already description
                }

                const preciseTitle = generatePreciseTitle(fullText);

                // Set the exact description to the full text
                perk.description = fullText;
                // Set the title to the precise short version
                perk.title = preciseTitle;

                updatedPerks++;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
    }

    console.log(`Updated ${updatedPerks} perks across ${files.length} files.`);
}

processFiles();
