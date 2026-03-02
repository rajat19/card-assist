/** Shared configuration for the card scraper */

/** Gemini model to use for data extraction */
export const GEMINI_MODEL = 'gemini-2.5-flash';

/** Maximum time (ms) to wait for a page to load */
export const PAGE_TIMEOUT_MS = 30_000;

/** Delay between scraping each card URL (ms) to stay within API rate limits */
export const SCRAPE_DELAY_MS = 5_000;

/** Max retries on rate-limit (429) errors */
export const MAX_RETRIES = 3;

/** Initial backoff delay (ms) for retry — doubles on each attempt */
export const INITIAL_BACKOFF_MS = 35_000;

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
    'au': 'au.json',
    'hsbc': 'hsbc.json',
};

/** URL domain patterns → bank slug. Used to auto-detect which bank a URL belongs to. */
export const BANK_URL_PATTERNS: [RegExp, string, string][] = [
    [/axis/, 'axis', 'Axis Bank'],
    [/au/, 'au', 'AU Bank'],
    [/hdfc/, 'hdfc', 'HDFC Bank'],
    [/hsbc/, 'hsbc', 'HSBC Bank'],
    [/icici/, 'icici', 'ICICI Bank'],
    [/idfc/, 'idfc-first', 'IDFC First Bank'],
    [/federal/, 'federal', 'Federal Bank'],
    [/indus/, 'indusind', 'IndusInd Bank'],
    [/rbl/, 'rbl', 'RBL Bank'],
    [/sbi/, 'sbi', 'SBI Bank'],
    [/yes/, 'yes', 'Yes Bank'],
    [/kotak/, 'kotak', 'Kotak Mahindra Bank'],
    [/bankofbaroda/, 'bank-of-baroda', 'Bank of Baroda'],
];

/**
 * Retry a function with exponential backoff on 429 (rate limit) errors.
 * Extracts retry delay from the error response when available.
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    label: string,
    maxRetries = MAX_RETRIES,
    initialBackoff = INITIAL_BACKOFF_MS,
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            lastError = err;
            const is429 = err instanceof Error && ('status' in err && (err as { status: number }).status === 429);
            if (!is429 || attempt === maxRetries) throw err;

            // Try to extract retry delay from error message
            let waitMs = initialBackoff * Math.pow(2, attempt);
            const retryMatch = String(err).match(/retry in ([\d.]+)s/i);
            if (retryMatch) {
                waitMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000; // add 1s buffer
            }

            console.log(`     ⏳ Rate limited (attempt ${attempt + 1}/${maxRetries}), waiting ${(waitMs / 1000).toFixed(0)}s...`);
            await new Promise((r) => setTimeout(r, waitMs));
        }
    }
    throw lastError;
}
