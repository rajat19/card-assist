import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import SearchCards, { AiSearchResult } from '@/components/SearchCards';
import CreditCardItem from '@/components/CreditCardItem';
import CardFiltersPanel, { CardFilters } from '@/components/CardFilters';
import heroImage from '@/assets/hero-credit-cards.jpg';
import { CREDIT_CARDS } from '@/data/creditCards';
import { Filter, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Index = () => {
  const cards = CREDIT_CARDS;

  // AI search state
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);

  // Filter state
  const [filters, setFilters] = useState<CardFilters>({
    banks: [],
    cardTypes: [],
    joiningFeeRange: [0, 100000],
    annualFeeRange: [0, 100000],
  });

  // Base list: either AI results or all cards
  const baseCards = aiResult ? aiResult.cards : cards;

  // Apply sidebar filters on top
  const filteredCards = useMemo(() => {
    return baseCards.filter(card => {
      if (filters.banks.length > 0 && !filters.banks.includes(card.bankName)) return false;
      if (filters.cardTypes.length > 0 && !filters.cardTypes.includes(card.cardType)) return false;
      const joiningFee = card.feesAndCharges.joining.value;
      if (joiningFee < filters.joiningFeeRange[0] || joiningFee > filters.joiningFeeRange[1]) return false;
      const annualFee = card.feesAndCharges.annual.value;
      if (annualFee < filters.annualFeeRange[0] || annualFee > filters.annualFeeRange[1]) return false;
      return true;
    });
  }, [baseCards, filters]);

  const handleSearchResults = (result: AiSearchResult) => {
    setAiResult(result);
  };

  const handleClearSearch = () => {
    setAiResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {/* Compact Hero Banner */}
        <div className="mb-6 relative">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-financial">
            <img
              src={heroImage}
              alt="Credit Cards"
              className="w-full h-32 md:h-36 object-cover opacity-20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Find Your Perfect Credit Card
                </h1>
                <p className="text-sm md:text-base text-white/90 max-w-xl">
                  Compare benefits across {cards.length} credit cards and discover which one gives you the best rewards
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Search - Mobile only (full width) */}
        <div className="mb-4 lg:hidden">
          <SearchCards
            cards={cards}
            onSearchResults={handleSearchResults}
            onClearSearch={handleClearSearch}
            hasActiveSearch={!!aiResult}
          />
        </div>

        {/* AI Results Banner */}
        {aiResult && (
          <div className="mb-4 flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="h-4 w-4 text-financial-blue shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground">
                  Best Cards for "{aiResult.displayQuery}"
                </span>
                {aiResult.reasoning && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{aiResult.reasoning}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearSearch} className="shrink-0 ml-2">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Header + Filter toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {aiResult ? `${filteredCards.length} Result${filteredCards.length !== 1 ? 's' : ''}` : 'All Credit Cards'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {aiResult
                ? `AI-ranked results${filters.banks.length || filters.cardTypes.length ? ', filtered' : ''}`
                : filteredCards.length === cards.length
                  ? `Browse all ${cards.length} available credit cards`
                  : `Showing ${filteredCards.length} of ${cards.length} credit cards`
              }
            </p>
          </div>
          {/* Mobile filter toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] overflow-y-auto p-4 sm:p-6">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <CardFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                totalCards={baseCards.length}
                filteredCount={filteredCards.length}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar: search + filters, sticky */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[72px] max-h-[calc(100vh-88px)] overflow-y-auto space-y-4 pb-4">
              <SearchCards
                cards={cards}
                onSearchResults={handleSearchResults}
                onClearSearch={handleClearSearch}
                hasActiveSearch={!!aiResult}
              />
              <CardFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                totalCards={baseCards.length}
                filteredCount={filteredCards.length}
              />
            </div>
          </aside>

          {/* Card grid */}
          <div className="flex-1 min-w-0">
            {filteredCards.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCards.map((card, index) => (
                  <CreditCardItem
                    key={card.name}
                    card={card}
                    rank={aiResult ? index + 1 : undefined}
                    aiReason={aiResult?.aiReasonByName[card.name]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold text-muted-foreground mb-2">No cards match your criteria</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
