import { Benefit, BenefitType, CardType, CreditCard } from '@/types/creditcard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard as CardIcon, ExternalLink, Sparkles, Trophy } from 'lucide-react';
import { getBankIcon, getBankColor } from '@/data/bankIcons';
import BenefitPill from '@/components/BenefitPill';

interface CreditCardItemProps {
  card: CreditCard;
  rank?: number;
  aiReason?: string;
}

const CreditCardItem = ({ card, rank, aiReason }: CreditCardItemProps) => {
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

  const getBenefit = (benefit: Benefit) => {
    switch (benefit.type) {
      case BenefitType.CASHBACK: return `₹${benefit.value}% cashback on ${benefit.category}`;
      case BenefitType.REWARD_POINTS: return `${benefit.value}% RP on ${benefit.category}`;
      case BenefitType.MILES: return `${benefit.value}% miles on ${benefit.category}`;
      case BenefitType.DISCOUNT: return `${benefit.value}% discount on ${benefit.category}`;
      case BenefitType.WAIVER: return `${benefit.value}% waiver on ${benefit.category}`;
      case BenefitType.REBATE: return `${benefit.value}% rebate on ${benefit.category}`;
      case BenefitType.REIMBURSEMENT: return `${benefit.value}% reimbursement on ${benefit.category}`;
      case BenefitType.VOUCHER: return `${benefit.value}% voucher on ${benefit.category}`;
      case BenefitType.FIXED: return `${benefit.value}% fixed on ${benefit.category}`;
      default: return `${benefit.value}% on ${benefit.category}`;
    }
  };

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
            <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-24">
              {card.benefits.map((benefit, index) => (
                <BenefitPill
                  key={index}
                  benefit={benefit}
                  accentColor={bankColor.accent}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

export default CreditCardItem;