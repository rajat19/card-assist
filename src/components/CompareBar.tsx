import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { X, Scale } from 'lucide-react';
import { MAX_COMPARE } from '@/contexts/CompareContext';

export function CompareBar({ onCompareClick }: { onCompareClick: () => void }) {
    const { selectedCards, clearCompare } = useCompare();

    if (selectedCards.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-foreground text-background shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 border border-border/50">
                <div className="flex -space-x-3 mr-2">
                    {selectedCards.map((card, idx) => (
                        <div
                            key={card.name}
                            className="w-8 h-8 rounded-full border-2 border-foreground bg-background flex items-center justify-center overflow-hidden shrink-0"
                            style={{ zIndex: 10 - idx }}
                            title={card.name}
                        >
                            <span className="text-xs font-bold text-foreground">
                                {card.bankName.slice(0, 1)}
                            </span>
                        </div>
                    ))}
                    {Array.from({ length: MAX_COMPARE - selectedCards.length }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 bg-background/10 shrink-0"
                            style={{ zIndex: 5 - i }}
                        />
                    ))}
                </div>

                <div className="text-sm font-medium mr-2 hidden sm:block">
                    {selectedCards.length} of {MAX_COMPARE} selected
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onCompareClick}
                    disabled={selectedCards.length < 2}
                    className="rounded-full shadow-sm hover:scale-105 transition-transform"
                >
                    <Scale className="w-4 h-4 mr-1.5" />
                    Compare Cards
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCompare}
                    className="rounded-full hover:bg-background/20 text-background hover:text-background h-8 w-8 ml-1"
                    title="Clear all"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
