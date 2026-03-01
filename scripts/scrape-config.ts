/** Shared configuration for the card scraper */

/** Gemini model to use for data extraction */
export const GEMINI_MODEL = 'gemini-2.5-flash';

/** Maximum time (ms) to wait for a page to load */
export const PAGE_TIMEOUT_MS = 30_000;

/** Delay between scraping each card URL (ms) to avoid rate-limiting */
export const SCRAPE_DELAY_MS = 2_000;

/** If a numeric fee changes by more than this factor, flag it as suspicious */
export const SUSPICIOUS_CHANGE_FACTOR = 5;

/** Path to the per-bank card JSON files relative to project root */
export const CARDS_DIR = 'src/data/cards';

/** Bank slug to file mapping — add new banks here */
export const BANK_FILES: Record<string, string> = {
    'axis': 'axis.json',
    'hdfc': 'hdfc.json',
    'icici': 'icici.json',
    'idfc-first': 'idfc-first.json',
    'federal': 'federal.json',
    'indusind': 'indusind.json',
    'rbl': 'rbl.json',
    'sbi': 'sbi.json',
    'yes': 'yes.json',
};
