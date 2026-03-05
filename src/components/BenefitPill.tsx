import { Benefit } from '@/types/creditcard';
import { getCategoryIcon, getBenefitSuffix } from '@/lib/benefitUtils';

interface BenefitPillProps {
    benefit: Benefit;
    accentColor?: string;
}

const BenefitPill = ({ benefit, accentColor }: BenefitPillProps) => {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-background/60 border border-border/50">
            {getCategoryIcon(benefit.category)}
            <span className="text-card-foreground">{benefit.category}</span>
            <span className="font-bold" style={{ color: accentColor }}>
                {benefit.value}%{getBenefitSuffix(benefit.type)}
            </span>
        </div>
    );
};

export default BenefitPill;
