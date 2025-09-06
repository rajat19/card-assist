import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

// Initialize Admin SDK once
try {
  admin.initializeApp();
} catch {}

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

type Benefit = {
  category: string;
  type: 'cashback' | 'reward_points';
  value: number;
  description?: string;
  conditions?: string;
};

type FeeItem = { value: number; type: 'fixed' | 'percentage'; description?: string };
type FeesAndCharges = {
  annual: FeeItem;
  joining: FeeItem;
  cashWithdrawal: FeeItem;
  forex: FeeItem;
  educationTransaction?: FeeItem;
  walletLoad?: FeeItem;
  utilityBillPayment?: FeeItem;
  rentTransaction?: FeeItem;
  fuelTransaction?: FeeItem;
  other?: FeeItem;
};

type CreditCard = {
  name: string;
  bankName: string;
  benefits: Benefit[];
  description?: string;
  cardType: 'premium' | 'regular' | 'entry' | 'cobrand';
  feesAndCharges: FeesAndCharges;
  link: string;
};

type AiSuggestRequest = { query: string; cards: CreditCard[] };
type AiSuggestResponse = { rankedCardNames: string[]; reasoning?: string };

export const aiSuggestCards = onCall<AiSuggestRequest, AiSuggestResponse>({
  region: 'us-central1',
  secrets: [GEMINI_API_KEY],
}, async (request) => {
  const { data } = request;
  if (!data || typeof data.query !== 'string' || !Array.isArray(data.cards)) {
    throw new Error('Invalid payload');
  }

  const query = data.query.trim();
  const cards = data.cards;

  const key = GEMINI_API_KEY.value();
  if (key) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a credit card rewards expert. Rank the following credit cards (by name) from best to worst for the user's query. The query is: "${query}". Consider categories, benefit types and values, and provide short reasoning. Return JSON with fields rankedCardNames (array of names) and reasoning (string). Cards JSON: ${JSON.stringify(cards)}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Attempt to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.rankedCardNames)) {
          return {
            rankedCardNames: parsed.rankedCardNames.filter((n: unknown) => typeof n === 'string'),
            reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : undefined,
          };
        }
      }
    } catch (err) {
      // Fall through to heuristic
    }
  }

  // Heuristic fallback: rank by max relevant benefit value given the query
  const q = query.toLowerCase();
  const ranked = cards
    .map((card) => {
      const relevant = card.benefits.filter((b) =>
        b.category.toLowerCase().includes(q) || (b.description?.toLowerCase().includes(q) ?? false)
      );
      const maxBenefit = relevant.length ? Math.max(...relevant.map((b) => b.value)) : 0;
      return { name: card.name, score: maxBenefit };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.name);

  return { rankedCardNames: ranked, reasoning: 'Heuristic ranking fallback used.' };
});


