import { CreditCard, Perk, Benefit } from '@/types/creditcard';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBankIcon, getBankColor } from '@/data/bankIcons';
import BenefitPill from '@/components/BenefitPill';
import PerkItem from '@/components/PerkItem';
import { ExternalLink, CreditCard as CardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PerkItemIcon from './PerkItemIcon';

interface CardDetailsSheetProps {
    card: CreditCard | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CardDetailsSheet({ card, open, onOpenChange }: CardDetailsSheetProps) {
    if (!card) return null;

    const BankIcon = getBankIcon(card.bankName);
    const bankColor = getBankColor(card.bankName);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:w-[450px] sm:max-w-[450px] p-0 flex flex-col h-full overflow-hidden">
                {/* Header Section */}
                <div
                    className="px-6 py-6 border-b shrink-0 bg-gradient-to-br from-background to-muted/30"
                    style={{ borderTop: `4px solid ${bankColor.accent}` }}
                >
                    <SheetHeader className="text-left space-y-4">
                        <div className="flex items-start justify-between">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                                style={{ backgroundColor: bankColor.bg }}
                            >
                                {BankIcon ? (
                                    <img src={BankIcon} alt={card.bankName} className="w-8 h-8 object-contain" />
                                ) : (
                                    <CardIcon className="w-6 h-6" style={{ color: bankColor.accent }} />
                                )}
                            </div>
                            <Badge variant="secondary" className="capitalize shrink-0">
                                {card.cardType}
                            </Badge>
                        </div>

                        <div>
                            <SheetTitle className="text-xl leading-tight mb-1" style={{ color: bankColor.accent }}>
                                {card.name}
                            </SheetTitle>
                            <SheetDescription className="text-sm">
                                {card.bankName}
                            </SheetDescription>
                        </div>
                    </SheetHeader>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 px-6 py-6" type="scroll">
                    <div className="space-y-8 pb-10">
                        {/* Description */}
                        {card.description && (
                            <div className="text-sm text-foreground/90 leading-relaxed italic border-l-2 pl-3 py-1" style={{ borderColor: bankColor.accent }}>
                                "{card.description}"
                            </div>
                        )}

                        {/* Fees */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fees & Charges</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <span className="block text-xs text-muted-foreground mb-1">Joining Fee</span>
                                    <span className="font-medium text-foreground">
                                        {card.feesAndCharges.joining.type === 'fixed'
                                            ? card.feesAndCharges.joining.value === 0 ? 'Free' : `₹${card.feesAndCharges.joining.value.toLocaleString('en-IN')}`
                                            : `${card.feesAndCharges.joining.value}%`}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <span className="block text-xs text-muted-foreground mb-1">Annual Fee</span>
                                    <span className="font-medium text-foreground">
                                        {card.feesAndCharges.annual.type === 'fixed'
                                            ? card.feesAndCharges.annual.value === 0 ? 'Free/Lifetime' : `₹${card.feesAndCharges.annual.value.toLocaleString('en-IN')}`
                                            : `${card.feesAndCharges.annual.value}%`}
                                    </span>
                                </div>
                                {card.feesAndCharges.forex.value > 0 && (
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 col-span-2">
                                        <span className="block text-xs text-muted-foreground mb-1">Forex Markup</span>
                                        <span className="font-medium text-foreground">{card.feesAndCharges.forex.value}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Earning Rates */}
                        {card.benefits && card.benefits.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Earning Rates</h4>
                                <div className="flex flex-wrap gap-2">
                                    {card.benefits.map((benefit: Benefit, i: number) => (
                                        <BenefitPill key={i} benefit={benefit} accentColor={bankColor.accent} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Perks */}
                        {card.perks && card.perks.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Features & Privileges</h4>
                                <div className="space-y-4">
                                    {card.perks.map((perk: Perk, i: number) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/50 bg-background shadow-sm">
                                            <PerkItemIcon perk={perk} />
                                            <div>
                                                <h5 className="text-sm font-medium text-foreground mb-1">{perk.title}</h5>
                                                {perk.description && perk.description !== perk.title && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{perk.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Data Source Info */}
                        <div className="text-xs text-muted-foreground/50 pt-4 border-t border-border/30 text-center">
                            Last updated: {card.updatedAt || 'N/A'} • Source: {card.dataSource || 'manual'}
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer actions */}
                <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]">
                    <Button
                        className="w-full h-12 text-base font-medium"
                        style={{ backgroundColor: bankColor.accent, color: 'white' }}
                        onClick={() => window.open(card.link, '_blank')}
                    >
                        Apply on Bank Website <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
