import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, X } from 'lucide-react';
import { CreditCard, CATEGORIES } from '@/types/creditcard';
import { aiSuggestCards } from '@/services/ai';

export interface AiSearchResult {
  cards: CreditCard[];
  aiReasonByName: Record<string, string | undefined>;
  reasoning?: string;
  displayQuery: string;
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

  const handleSearch = async (customQuery?: string) => {
    const effectiveQuery = (customQuery ?? searchQuery).trim();
    if (!effectiveQuery) return;

    setLoading(true);
    try {
      const { results, reasoning } = await aiSuggestCards(effectiveQuery, cards);
      const nameToCard = new Map(cards.map((c) => [c.name, c]));
      const rankedCards = results.map((r) => nameToCard.get(r.name)).filter(Boolean) as CreditCard[];
      const rmap: Record<string, string | undefined> = {};
      results.forEach((r) => { rmap[r.name] = r.reason; });

      const candidateFromInput = CATEGORIES.find((cat) => effectiveQuery.toLowerCase().includes(cat.toLowerCase()));
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

      onSearchResults({ cards: rankedCards, aiReasonByName: rmap, reasoning, displayQuery });
    } finally {
      setLoading(false);
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
                placeholder="Search by merchant or category (e.g., Amazon, Travel, Dining)"
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  void handleSearch();
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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {popularQueries.map((query) => (
              <Button
                key={query}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(query);
                  void handleSearch(query);
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
          <TrendingUp className="h-4 w-4 text-financial-blue shrink-0" />
          <span className="text-sm text-muted-foreground">AI-powered results</span>
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