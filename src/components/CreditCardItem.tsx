import { useState } from 'react';
import { Benefit, BenefitType, CardType, CreditCard } from '@/types/creditcard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard as CardIcon, ExternalLink, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { getBankIcon, getBankColor } from '@/data/bankIcons';
import BenefitPill from '@/components/BenefitPill';
import PerkItem from '@/components/PerkItem';

interface CreditCardItemProps {
  card: CreditCard;
  rank?: number;
  aiReason?: string;
}

const VISIBLE_COUNT = 4;

const CreditCardItem = ({ card, rank, aiReason }: CreditCardItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const getCardTypeColor = (type: CardType) => {
    switch (type) {
      case CardType.PREMIUM: return 'bg-gradient-financial text-white';
      case CardType.REGULAR: return 'bg-primary text-primary-foreground';
      case CardType.ENTRY: return 'bg-secondary text-secondary-foreground';
      case CardType.COBRAND: return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRankStyle = (r: number) => {
    if (r === 1) return { background: 'linear-gradient(135deg, #FFD700, #FFA000)', color: '#fff' };
    if (r === 2) return { background: 'linear-gradient(135deg, #C0C0C0, #9E9E9E)', color: '#fff' };
    if (r === 3) return { background: 'linear-gradient(135deg, #CD7F32, #A0522D)', color: '#fff' };
    return { background: 'hsl(213, 94%, 68%)', color: '#fff' };
  };

  const bankIcon = getBankIcon(card.bankName);
  const bankColor = getBankColor(card.bankName);

  return (
    <a
      href={card.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline group h-full"
    >
      <Card
        className="relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border-0 cursor-pointer
                   hover:scale-[1.02] hover:-translate-y-1 h-full flex flex-col"
        style={{ background: bankColor.bg }}
      >
        {/* Bank-colored left accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
          style={{ background: bankColor.border }}
        />

        {/* Rank badge */}
        {rank != null && (
          <div
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10"
            style={getRankStyle(rank)}
          >
            {rank <= 3 ? <Trophy className="h-4 w-4" /> : `#${rank}`}
          </div>
        )}

        <CardHeader className="pb-3 pl-5">
          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg border"
                style={{ borderColor: `${bankColor.accent}33`, background: `${bankColor.bg}` }}
              >
                {bankIcon ? (
                  <img src={bankIcon} alt={card.bankName} className="h-5 w-5 object-contain" />
                ) : (
                  <CardIcon className="h-5 w-5" style={{ color: bankColor.accent }} />
                )}
              </div>
              <div>
                <CardTitle className="text-lg text-card-foreground group-hover:text-financial-blue transition-colors flex items-center gap-1.5">
                  {card.name}
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">{card.bankName}</p>
              </div>
            </div>
            <Badge className={`${getCardTypeColor(card.cardType)} capitalize font-medium shrink-0`}>
              {card.cardType}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pl-5 flex-1 flex flex-col min-h-0">
          {/* AI Reason callout — search results only */}
          {aiReason && (
            <div
              className="flex items-start gap-2 p-2.5 rounded-lg text-sm"
              style={{ background: `${bankColor.bg}`, borderLeft: `3px solid ${bankColor.accent}` }}
            >
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: bankColor.accent }} />
              <span className="text-card-foreground/80 leading-snug">{aiReason}</span>
            </div>
          )}

          {card.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col p-2 rounded-lg bg-background/60">
              <span className="text-xs text-muted-foreground">Joining Fee</span>
              <span className="font-semibold text-card-foreground">
                {card.feesAndCharges.joining.type === 'fixed' ? `₹${card.feesAndCharges.joining.value.toLocaleString('en-IN')}` : `${card.feesAndCharges.joining.value}%`}
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-lg bg-background/60">
              <span className="text-xs text-muted-foreground">Annual Fee</span>
              <span className="font-semibold text-card-foreground">
                {card.feesAndCharges.annual.type === 'fixed' ? `₹${card.feesAndCharges.annual.value.toLocaleString('en-IN')}` : `${card.feesAndCharges.annual.value}%`}
              </span>
            </div>
          </div>

          <div className="space-y-2 flex-1 min-h-0 flex flex-col">
            <h4 className="text-sm font-medium text-card-foreground shrink-0">Key Benefits</h4>
            <div className="flex flex-wrap gap-1.5">
              {card.benefits.slice(0, expanded ? undefined : VISIBLE_COUNT).map((benefit, index) => (
                <BenefitPill
                  key={index}
                  benefit={benefit}
                  accentColor={bankColor.accent}
                />
              ))}
              {card.benefits.length > VISIBLE_COUNT && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                             bg-background/80 border border-border/50 text-muted-foreground
                             hover:bg-background hover:text-foreground hover:border-border
                             transition-colors cursor-pointer"
                >
                  {expanded ? (
                    <><ChevronUp className="h-3 w-3" /> less</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> +{card.benefits.length - VISIBLE_COUNT} more</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Perks section */}
          {card.perks && card.perks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Perks</h4>
              <div className="space-y-1">
                {card.perks.slice(0, expanded ? undefined : 2).map((perk, index) => (
                  <PerkItem key={index} perk={perk} accentColor={bankColor.accent} />
                ))}
                {card.perks.length > 2 && !expanded && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronDown className="h-3 w-3" />
                    +{card.perks.length - 2} more perks
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
};

export default CreditCardItem;