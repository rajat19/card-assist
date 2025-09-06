import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp } from 'lucide-react';
import { BenefitType, CreditCard, CATEGORIES } from '@/types/creditcard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { aiSuggestCards } from '@/services/ai';

interface SearchCardsProps {
  cards: CreditCard[];
}

const SearchCards = ({ cards }: SearchCardsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CreditCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overallReasoning, setOverallReasoning] = useState<string | undefined>(undefined);
  const [aiReasonByName, setAiReasonByName] = useState<Record<string, string | undefined>>({});
  const [displayQuery, setDisplayQuery] = useState<string>('');
  const [resultKey, setResultKey] = useState<string>('');

  const handleSearch = async (customQuery?: string) => {
    const effectiveQuery = (customQuery ?? searchQuery).trim();
    if (!effectiveQuery) return;

    // Prepare UI for fresh search
    setHasSearched(true);
    setLoading(true);
    setSearchResults([]);
    setOverallReasoning(undefined);
    setAiReasonByName({});
    setDisplayQuery('');
    setResultKey('');
    try {
      const { results, reasoning } = await aiSuggestCards(effectiveQuery, cards);
      const nameToCard = new Map(cards.map((c) => [c.name, c]));
      const rankedCards = results.map((r) => nameToCard.get(r.name)).filter(Boolean) as CreditCard[];
      setSearchResults(rankedCards);
      const rmap: Record<string, string | undefined> = {};
      results.forEach((r) => { rmap[r.name] = r.reason; });
      setAiReasonByName(rmap);
      setOverallReasoning(reasoning);
      // Derive a concise display label and a normalized key for matching
      const candidateFromInput = CATEGORIES.find((cat) => effectiveQuery.toLowerCase().includes(cat.toLowerCase()));
      let label: string | undefined = candidateFromInput as string | undefined;
      let key = candidateFromInput?.toLowerCase() ?? '';
      if (!label && rankedCards[0]) {
        const all = rankedCards[0].benefits ?? [];
        if (all.length) {
          const topBenefit = all.reduce((acc, b) => (b.value > acc.value ? b : acc), all[0]);
          label = topBenefit.category;
          key = label.toLowerCase();
        }
      }
      setDisplayQuery(label || 'Top Picks');
      setResultKey(key);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularQueries = ['Amazon', 'Flipkart', 'Swiggy', 'Travel', 'Fuel', 'Dining'];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-financial-light rounded-lg">
              <Search className="h-5 w-5 text-financial-blue" />
            </div>
            <CardTitle className="text-xl text-card-foreground">Find Best Credit Card</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter merchant or category (e.g., Amazon, Travel, Dining)"
              className="flex-1"
            />
            <Button 
              onClick={(e) => {
                e.preventDefault();
                void handleSearch();
              }}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((query) => (
                <Button
                  key={query}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(query);
                    void handleSearch(query);
                  }}
                  className="text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-financial-blue" />
            {loading ? (
              <h2 className="text-xl font-semibold text-foreground">Searching…</h2>
            ) : (
              <h2 className="text-xl font-semibold text-foreground">
                Best Cards for "{displayQuery || searchQuery}"
              </h2>
            )}
            <span className="text-sm text-muted-foreground">
              ({searchResults.length} result{searchResults.length !== 1 ? 's' : ''})
            </span>
          </div>

          {!loading && overallReasoning && (
            <p className="text-sm text-muted-foreground">
              {overallReasoning}
            </p>
          )}

          {loading ? (
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-financial-blue border-t-transparent animate-spin" />
                    <span className="text-sm text-muted-foreground">Finding the best cards for you...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : searchResults.length === 0 ? (
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  No matching cards found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Try searching for popular categories like "Amazon", "Travel", "Dining", or "Fuel"
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card</TableHead>
                        <TableHead>Best Match Benefit</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Why</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((card) => {
                        const q = (resultKey || searchQuery).toLowerCase();
                        const relevant = card.benefits.filter((b) =>
                          b.category.toLowerCase().includes(q) || (b.description?.toLowerCase().includes(q) ?? false)
                        );
                        const pool = relevant.length ? relevant : (card.benefits ?? []);
                        const best = pool.length
                          ? pool.reduce((acc, b) => (b.value > acc.value ? b : acc), pool[0])
                          : undefined;
                        return (
                          <TableRow key={card.name}>
                            <TableCell className="font-medium">{card.name}</TableCell>
                            <TableCell>
                              {best ? (
                                <span>
                                  {best.category}: {best.value}%{best.type === BenefitType.REWARD_POINTS ? ' RP' : ''}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[360px] truncate" title={card.description || ''}>
                              {card.description || '—'}
                            </TableCell>
                            <TableCell className="max-w-[360px] truncate" title={aiReasonByName[card.name] || ''}>
                              {aiReasonByName[card.name] || '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchCards;