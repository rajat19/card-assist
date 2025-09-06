import { BenefitType, CardType, CreditCard } from '@/types/creditcard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard as CardIcon, Banknote, Award } from 'lucide-react';

interface CreditCardItemProps {
  card: CreditCard;
}

const CreditCardItem = ({ card }: CreditCardItemProps) => {
  const getCardTypeColor = (type: CardType) => {
    switch (type) {
      case CardType.PREMIUM: return 'bg-gradient-financial text-white';
      case CardType.REGULAR: return 'bg-primary text-primary-foreground';
      case CardType.ENTRY: return 'bg-secondary text-secondary-foreground';
      case CardType.COBRAND: return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-financial-light rounded-lg">
              <CardIcon className="h-5 w-5 text-financial-blue" />
            </div>
            <div>
              <CardTitle className="text-lg text-card-foreground">{card.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{card.bankName}</p>
            </div>
          </div>
          <Badge className={`${getCardTypeColor(card.cardType)} capitalize font-medium`}>
            {card.cardType}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {card.description && (
          <p className="text-sm text-muted-foreground">{card.description}</p>
        )}
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Joining Fee</span>
            <span className="font-semibold text-card-foreground">
              {card.feesAndCharges.joining.type === 'fixed' ? `₹${card.feesAndCharges.joining.value}` : `${card.feesAndCharges.joining.value}%`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Annual Fee</span>
            <span className="font-semibold text-card-foreground">
              {card.feesAndCharges.annual.type === 'fixed' ? `₹${card.feesAndCharges.annual.value}` : `${card.feesAndCharges.annual.value}%`}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-card-foreground">Key Benefits</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {card.benefits.slice(0, 4).map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-financial-light rounded-md">
                <div className="flex items-center gap-2">
                  {benefit.type === BenefitType.CASHBACK ? (
                    <Banknote className="h-4 w-4 text-financial-green" />
                  ) : (
                    <Award className="h-4 w-4 text-financial-blue" />
                  )}
                  <span className="text-sm font-medium text-card-foreground">
                    {benefit.category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-financial-blue">
                  {benefit.value}%{benefit.type === BenefitType.REWARD_POINTS ? ' RP' : ''}
                </span>
              </div>
            ))}
            {card.benefits.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{card.benefits.length - 4} more benefits
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditCardItem;