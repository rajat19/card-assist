import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import CreditCardItem from '@/components/CreditCardItem';
import CardFiltersPanel, { CardFilters } from '@/components/CardFilters';
import { CREDIT_CARDS } from '@/data/creditCards';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const AllCards = () => {
    const cards = CREDIT_CARDS;
    const [filters, setFilters] = useState<CardFilters>({
        banks: [],
        cardTypes: [],
        joiningFeeRange: [0, 100000],
        annualFeeRange: [0, 100000],
    });

    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            // Bank filter
            if (filters.banks.length > 0 && !filters.banks.includes(card.bankName)) {
                return false;
            }
            // Card type filter
            if (filters.cardTypes.length > 0 && !filters.cardTypes.includes(card.cardType)) {
                return false;
            }
            // Joining fee range
            const joiningFee = card.feesAndCharges.joining.value;
            if (joiningFee < filters.joiningFeeRange[0] || joiningFee > filters.joiningFeeRange[1]) {
                return false;
            }
            // Annual fee range
            const annualFee = card.feesAndCharges.annual.value;
            if (annualFee < filters.annualFeeRange[0] || annualFee > filters.annualFeeRange[1]) {
                return false;
            }
            return true;
        });
    }, [cards, filters]);

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">All Credit Cards</h2>
                        <p className="text-muted-foreground">
                            {filteredCards.length === cards.length
                                ? `Browse all ${cards.length} available credit cards`
                                : `Showing ${filteredCards.length} of ${cards.length} credit cards`
                            }
                        </p>
                    </div>
                    {/* Mobile filter toggle using Sheet */}
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
                                totalCards={cards.length}
                                filteredCount={filteredCards.length}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex gap-8">
                    {/* Filter sidebar - desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <CardFiltersPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            totalCards={cards.length}
                            filteredCount={filteredCards.length}
                        />
                    </aside>

                    {/* Card grid */}
                    <div className="flex-1 min-w-0">
                        {filteredCards.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredCards.map((card) => (
                                    <CreditCardItem key={card.name} card={card} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-xl font-semibold text-muted-foreground mb-2">No cards match your filters</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AllCards;
