import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { getFirebaseApp } from '@/lib/firebase';
import type { CreditCard } from '@/types/creditcard';

export type AiSuggestRequest = {
  query: string;
  cards: CreditCard[];
};

export type AiSuggestResponse = {
  results: { name: string; reason?: string }[];
  reasoning?: string;
};

export async function aiSuggestCards(query: string, cards: CreditCard[]): Promise<AiSuggestResponse> {
  try {
    const app = getFirebaseApp();
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

    // Reduce payload size by selecting only fields that matter for ranking
    const compactCards = cards.map((c) => ({
      name: c.name,
      bankName: c.bankName,
      cardType: c.cardType,
      feesAndCharges: c.feesAndCharges,
      benefits: c.benefits.map((b) => ({
        category: b.category,
        type: b.type,
        value: b.value,
        description: b.description ?? '',
      })),
    }));

    const systemPrompt = `You are a credit card rewards expert. Rank the given credit cards for the user's query.
Return STRICT JSON with keys: results (array of up to 5 objects with keys name and optional reason) and reasoning (short string).`;

    const userPrompt = `Query: ${query}\nCards: ${JSON.stringify(compactCards)}`;
    console.log(userPrompt);
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.results)) {
        return {
          results: (parsed.results as unknown[])
            .map((r) => {
              if (typeof r === 'string') return { name: r };
              if (r && typeof r === 'object') {
                const obj = r as Record<string, unknown>;
                const name = obj.name ?? obj.card ?? obj.title;
                const reason = obj.reason ?? obj.why ?? obj.explanation;
                return { name: String(name ?? ''), reason: reason == null ? undefined : String(reason) };
              }
              return { name: '' };
            })
            .filter((r) => r.name)
            .slice(0, 5),
          reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : undefined,
        };
      }
      // Backward compatibility if model returns rankedCardNames
      if (Array.isArray(parsed.rankedCardNames)) {
        return {
          results: parsed.rankedCardNames
            .filter((n: unknown) => typeof n === 'string')
            .slice(0, 5)
            .map((name: string) => ({ name })),
          reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : undefined,
        };
      }
    }
    throw new Error('AI response parsing failed');
  } catch (error) {
    // Fallback: simple relevance by max matching benefit value
    const q = query.toLowerCase();
    const scored = cards
      .map((card) => {
        const relevant = card.benefits.filter((b) =>
          b.category.toLowerCase().includes(q) || (b.description?.toLowerCase().includes(q) ?? false)
        );
        const best = relevant.reduce<{ value: number; category?: string; description?: string }>((acc, b) =>
          b.value > acc.value ? { value: b.value, category: b.category, description: b.description } : acc,
        { value: 0 });
        const reason = best.value > 0 ? `Up to ${best.value}% on ${best.category ?? 'relevant spends'}` : undefined;
        return { name: card.name, score: best.value, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ name, reason }) => ({ name, reason }));
    return { results: scored };
  }
}


