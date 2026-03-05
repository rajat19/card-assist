import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, X, Sparkles } from 'lucide-react';
import { CreditCard, CATEGORIES } from '@/types/creditcard';
import { aiSuggestCards } from '@/services/ai';
import { searchCards } from '@/lib/cardSearch';

export interface AiSearchResult {
  cards: CreditCard[];
  aiReasonByName: Record<string, string | undefined>;
  reasoning?: string;
  displayQuery: string;
  isAiPowered: boolean;
}

interface SearchCardsProps {
  cards: CreditCard[];
  onSearchResults: (result: AiSearchResult) => void;
  onClearSearch: () => void;
  hasActiveSearch: boolean;
}

const SearchCards = ({ cards, onSearchResults, onClearSearch, hasActiveSearch }: SearchCardsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAi, setUseAi] = useState(false);

  const handleKeywordSearch = (query: string) => {
    const results = searchCards(query, cards);
    onSearchResults({
      cards: results,
      aiReasonByName: {},
      displayQuery: query,
      isAiPowered: false,
    });
  };

  const handleAiSearch = async (query: string) => {
    setLoading(true);
    try {
      const { results, reasoning } = await aiSuggestCards(query, cards);
      const nameToCard = new Map(cards.map((c) => [c.name, c]));
      const rankedCards = results.map((r) => nameToCard.get(r.name)).filter(Boolean) as CreditCard[];
      const rmap: Record<string, string | undefined> = {};
      results.forEach((r) => { rmap[r.name] = r.reason; });

      const candidateFromInput = CATEGORIES.find((cat) => query.toLowerCase().includes(cat.toLowerCase()));
      const label: string | undefined = candidateFromInput as string | undefined;
      let displayQuery = '';
      if (!label && rankedCards[0]) {
        const all = rankedCards[0].benefits ?? [];
        if (all.length) {
          const topBenefit = all.reduce((acc, b) => (b.value > acc.value ? b : acc), all[0]);
          displayQuery = topBenefit.category;
        } else {
          displayQuery = 'Top Picks';
        }
      } else {
        displayQuery = label || 'Top Picks';
      }

      onSearchResults({ cards: rankedCards, aiReasonByName: rmap, reasoning, displayQuery, isAiPowered: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (customQuery?: string) => {
    const effectiveQuery = (customQuery ?? searchQuery).trim();
    if (!effectiveQuery) return;

    if (useAi) {
      void handleAiSearch(effectiveQuery);
    } else {
      handleKeywordSearch(effectiveQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClearSearch();
  };

  const popularQueries = ['Amazon', 'Flipkart', 'Swiggy', 'Travel', 'Fuel', 'Dining'];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by merchant, category, or perk..."
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex-1 h-11"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              {hasActiveSearch && (
                <Button variant="outline" size="icon" onClick={handleClear} title="Clear search" className="h-11 w-11 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* AI Search Toggle — prominent */}
          <button
            onClick={() => setUseAi(!useAi)}
            className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${useAi
              ? 'bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-violet-500/10 border-violet-500/40 shadow-[0_0_12px_-3px_rgba(139,92,246,0.15)]'
              : 'bg-muted/30 border-border/50 hover:border-border hover:bg-muted/50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${useAi ? 'bg-violet-500/15' : 'bg-muted'}`}>
                <Sparkles className={`h-3.5 w-3.5 ${useAi ? 'text-violet-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-left">
                <span className={`text-xs font-semibold block leading-tight ${useAi ? 'text-violet-600 dark:text-violet-400' : 'text-foreground'}`}>
                  AI-Powered Search
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {useAi ? 'Using Gemini for smart ranking' : 'Enable for intelligent recommendations'}
                </span>
              </div>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${useAi
              ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
              : 'bg-muted text-muted-foreground'
              }`}>
              {useAi ? 'On' : 'Off'}
            </div>
          </button>

          {/* Popular Queries */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {popularQueries.map((query) => (
              <Button
                key={query}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(query);
                  handleSearch(query);
                }}
                className="text-xs h-7 px-3"
                disabled={loading}
              >
                {query}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Reasoning Banner */}
      {hasActiveSearch && !loading && (
        <div className="flex items-center gap-2 px-1">
          {useAi ? (
            <>
              <TrendingUp className="h-4 w-4 text-financial-blue shrink-0" />
              <span className="text-sm text-muted-foreground">AI-powered results</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Keyword search results</span>
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-financial-blue border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">Finding the best cards for you...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchCards;