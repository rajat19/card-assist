import { useCompare } from '@/contexts/CompareContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBankIcon, getBankColor } from '@/data/bankIcons';
import { Check, X, CreditCard as CardIcon, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompareDialog({ open, onOpenChange }: CompareDialogProps) {
    const { selectedCards, toggleCardToCompare } = useCompare();

    if (selectedCards.length === 0) return null;



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-xl">Compare Credit Cards</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1" type="scroll">
                    <div className="p-6 overflow-x-auto">
                        {/* 
              By converting this to a true CSS Grid table layout rather than flex columns,
              we strictly guarantee perfect vertical alignment pixel-for-pixel across all rows, 
              preventing horizontal edge-overflow artifacts and varying column heights.
            */}
                        <div
                            className="grid gap-x-4 pb-4"
                            style={{
                                gridTemplateColumns: `140px repeat(${selectedCards.length}, 1fr)`
                            }}
                        >
                            {/* --- ROW: Header --- */}
                            <div className="sticky left-0 bg-background z-20"></div>
                            {selectedCards.map(card => {
                                const bankIcon = getBankIcon(card.bankName);
                                const bankColor = getBankColor(card.bankName);
                                return (
                                    <div key={`header-${card.name}`} className="h-[180px] p-5 rounded-t-xl border-x border-t border-border/50 flex flex-col relative shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]" style={{ backgroundColor: `${bankColor.bg}10` }}>
                                        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: `${bankColor.bg}`, opacity: 0.15 }}></div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-background/80 z-10"
                                            onClick={() => toggleCardToCompare(card)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-3 mb-3 shrink-0 z-10">
                                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/40">
                                                {bankIcon ? <img src={bankIcon} className="w-6 h-6 object-contain" /> : <CardIcon className="w-5 h-5" style={{ color: bankColor.accent }} />}
                                            </div>
                                            <Badge variant="secondary" className="bg-background/80">{card.cardType}</Badge>
                                        </div>
                                        <h3 className="font-semibold text-base leading-tight break-words pr-6 z-10" style={{ color: bankColor.accent }}>
                                            {card.name}
                                        </h3>
                                        <p className="text-sm text-foreground/70 mt-auto z-10 font-medium">{card.bankName}</p>
                                    </div>
                                );
                            })}


                            {/* --- ROW: Joining Fee --- */}
                            <div className="sticky left-0 bg-background z-10 flex items-center font-medium text-muted-foreground border-b border-border/50 py-5">
                                Joining Fee
                            </div>
                            {selectedCards.map(card => (
                                <div key={`joining-${card.name}`} className="flex items-center font-semibold border-x border-b border-border/50 p-5 bg-background">
                                    {card.feesAndCharges.joining.type === 'fixed'
                                        ? card.feesAndCharges.joining.value === 0 ? 'Free' : `₹${card.feesAndCharges.joining.value.toLocaleString('en-IN')}`
                                        : `${card.feesAndCharges.joining.value}%`}
                                </div>
                            ))}


                            {/* --- ROW: Annual Fee --- */}
                            <div className="sticky left-0 bg-background z-10 flex items-center font-medium text-muted-foreground border-b border-border/50 py-5">
                                Annual Fee
                            </div>
                            {selectedCards.map(card => (
                                <div key={`annual-${card.name}`} className="flex items-center font-semibold border-x border-b border-border/50 p-5 bg-background">
                                    {card.feesAndCharges.annual.type === 'fixed'
                                        ? card.feesAndCharges.annual.value === 0 ? 'Lifetime Free' : `₹${card.feesAndCharges.annual.value.toLocaleString('en-IN')}`
                                        : `${card.feesAndCharges.annual.value}%`}
                                </div>
                            ))}


                            {/* --- ROW: Forex Markup --- */}
                            <div className="sticky left-0 bg-background z-10 flex items-center font-medium text-muted-foreground border-b border-border/50 py-5">
                                Forex Markup
                            </div>
                            {selectedCards.map(card => (
                                <div key={`forex-${card.name}`} className="flex items-center font-semibold border-x border-b border-border/50 p-5 bg-background">
                                    {card.feesAndCharges.forex.value > 0 ? `${card.feesAndCharges.forex.value}%` : 'Zero Markup'}
                                </div>
                            ))}


                            {/* --- ROW: Key Earning Rate --- */}
                            <div className="sticky left-0 bg-background z-10 font-medium text-muted-foreground py-6 border-b border-border/50">
                                Key Earning Rate
                            </div>
                            {selectedCards.map(card => {
                                const generalReward = card.benefits.find(b => b.category.toLowerCase() === 'general');
                                const topBenefit = card.benefits.find(b => b.category.toLowerCase() !== 'general') || generalReward;
                                return (
                                    <div key={`earn-${card.name}`} className="h-full border-x border-b border-border/50 p-5 bg-background flex flex-col justify-center">
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-sm">
                                            {topBenefit ? (
                                                <div><span className="font-bold text-foreground">{topBenefit.value}{topBenefit.type === 'cashback' ? '%' : 'x'}</span> on <span className="font-medium text-foreground/80">{topBenefit.category}</span></div>
                                            ) : 'N/A'}
                                            {generalReward && generalReward !== topBenefit && (
                                                <div className="text-muted-foreground mt-1.5 text-xs font-medium">Base: {generalReward.value}{generalReward.type === 'cashback' ? '%' : 'x'}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}


                            {/* --- ROW: Top Perks --- */}
                            <div className="sticky left-0 bg-background z-10 font-medium text-muted-foreground py-6 border-b border-border/50">
                                Top Perks
                            </div>
                            {selectedCards.map(card => (
                                <div key={`perks-${card.name}`} className="h-full pb-2 border-x border-b border-border/50 p-5 bg-background">
                                    <ul className="space-y-3.5">
                                        {card.perks?.slice(0, 4).map((perk, i) => (
                                            <li key={i} className="flex gap-2.5 text-sm">
                                                <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                                                <span className="text-foreground/90 leading-snug break-words">{perk.title}</span>
                                            </li>
                                        ))}
                                        {(!card.perks || card.perks.length === 0) && (
                                            <li className="text-sm text-muted-foreground italic h-[40px]">No listed perks</li>
                                        )}
                                        {card.perks && card.perks.length > 4 && (
                                            <li className="text-xs text-muted-foreground font-medium pt-1">
                                                +{card.perks.length - 4} more perks
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))}


                            {/* --- ROW: Apply Button --- */}
                            <div className="sticky left-0 bg-background z-20"></div>
                            {selectedCards.map(card => {
                                const bankColor = getBankColor(card.bankName);
                                return (
                                    <div key={`apply-${card.name}`} className="flex items-end p-5 border-x border-b border-border/50 rounded-b-xl bg-background shadow-[0_4px_10px_-3px_rgba(0,0,0,0.05)]">
                                        <Button
                                            className="w-full shadow-md font-semibold text-[15px] hover:brightness-110 active:scale-95 transition-all h-[44px]"
                                            style={{ backgroundColor: bankColor.accent, color: 'white' }}
                                            onClick={() => window.open(card.link, '_blank')}
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
