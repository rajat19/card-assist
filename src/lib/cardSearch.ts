import Fuse from 'fuse.js';
import type { CreditCard } from '@/types/creditcard';

// Flatten nested benefit/perk fields into a searchable record for Fuse
interface SearchableCard {
    name: string;
    description: string;
    bankName: string;
    benefitCategories: string;
    benefitDescriptions: string;
    perkTitles: string;
    perkDescriptions: string;
    _original: CreditCard;
}

const flattenCard = (card: CreditCard): SearchableCard => ({
    name: card.name,
    description: card.description ?? '',
    bankName: card.bankName,
    benefitCategories: card.benefits.map(b => b.category).join(' '),
    benefitDescriptions: card.benefits.map(b => b.description ?? '').join(' '),
    perkTitles: (card.perks ?? []).map(p => p.title).join(' '),
    perkDescriptions: (card.perks ?? []).map(p => p.description ?? '').join(' '),
    _original: card,
});

const FUSE_OPTIONS = {
    keys: [
        { name: 'name', weight: 3 },
        { name: 'benefitCategories', weight: 2 },
        { name: 'benefitDescriptions', weight: 1.5 },
        { name: 'perkTitles', weight: 1.5 },
        { name: 'perkDescriptions', weight: 1 },
        { name: 'description', weight: 1 },
        { name: 'bankName', weight: 0.5 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true,
};

let cachedIndex: { cards: CreditCard[]; fuse: Fuse<SearchableCard> } | null = null;

function getIndex(cards: CreditCard[]): Fuse<SearchableCard> {
    // Rebuild only if the card array reference changed
    if (cachedIndex && cachedIndex.cards === cards) {
        return cachedIndex.fuse;
    }
    const docs = cards.map(flattenCard);
    const fuse = new Fuse(docs, FUSE_OPTIONS);
    cachedIndex = { cards, fuse };
    return fuse;
}

export function searchCards(query: string, cards: CreditCard[]): CreditCard[] {
    const trimmed = query.trim();
    if (!trimmed) return cards;

    const fuse = getIndex(cards);
    const results = fuse.search(trimmed);
    return results.map(r => r.item._original);
}
