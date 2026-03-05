import { Benefit } from '@/types/creditcard';
import { getCategoryIcon, getBenefitSuffix, getBenefitTypeLabel } from '@/lib/benefitUtils';

interface BenefitDetailedProps {
    benefit: Benefit;
    accentColor?: string;
}

const BenefitDetailed = ({ benefit, accentColor }: BenefitDetailedProps) => {
    return (
        <div className="flex gap-3 p-3 rounded-lg border border-border/50 bg-background shadow-sm">
            <div className="mt-0.5">
                {getCategoryIcon(benefit.category, 'lg')}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{benefit.category}</span>
                    <span className="text-sm font-bold" style={{ color: accentColor }}>
                        {benefit.value}%{getBenefitSuffix(benefit.type)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                        {getBenefitTypeLabel(benefit.type)}
                    </span>
                </div>
                {benefit.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{benefit.description}</p>
                )}
            </div>
        </div>
    );
};

export default BenefitDetailed;
