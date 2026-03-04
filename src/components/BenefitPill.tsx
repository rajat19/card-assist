import { Benefit, BenefitType } from '@/types/creditcard';
import {
    Plane, ShoppingCart, Utensils, Fuel, ShoppingBag,
    Zap, GraduationCap, Shield, Globe, Gift, Bike,
    Popcorn, Package, Star,
} from 'lucide-react';

interface BenefitPillProps {
    benefit: Benefit;
    accentColor?: string;
}

const ICON_CLASS = 'h-3 w-3 shrink-0';

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('travel') || cat.includes('international')) return <Plane className={`${ICON_CLASS} text-blue-500`} />;
    if (cat.includes('amazon') || cat.includes('flipkart') || cat.includes('online shopping')) return <ShoppingCart className={`${ICON_CLASS} text-orange-500`} />;
    if (cat.includes('shopping')) return <ShoppingBag className={`${ICON_CLASS} text-pink-500`} />;
    if (cat.includes('dining') || cat.includes('swiggy') || cat.includes('zomato')) return <Utensils className={`${ICON_CLASS} text-red-500`} />;
    if (cat.includes('fuel')) return <Fuel className={`${ICON_CLASS} text-amber-600`} />;
    if (cat.includes('entertainment') || cat.includes('bookmyshow')) return <Popcorn className={`${ICON_CLASS} text-purple-500`} />;
    if (cat.includes('grocer')) return <Package className={`${ICON_CLASS} text-green-600`} />;
    if (cat.includes('utilit')) return <Zap className={`${ICON_CLASS} text-yellow-500`} />;
    if (cat.includes('education')) return <GraduationCap className={`${ICON_CLASS} text-indigo-500`} />;
    if (cat.includes('insurance')) return <Shield className={`${ICON_CLASS} text-teal-500`} />;
    if (cat.includes('uber') || cat.includes('ola')) return <Bike className={`${ICON_CLASS} text-gray-600`} />;
    if (cat.includes('lifestyle')) return <Gift className={`${ICON_CLASS} text-rose-500`} />;
    if (cat.includes('adani')) return <Globe className={`${ICON_CLASS} text-emerald-500`} />;
    return <Star className={`${ICON_CLASS} text-financial-blue`} />;
};

const getBenefitSuffix = (type: BenefitType) => {
    switch (type) {
        case BenefitType.CASHBACK: return '';
        case BenefitType.REWARD_POINTS: return ' RP';
        case BenefitType.MILES: return ' mi';
        case BenefitType.DISCOUNT: return ' off';
        case BenefitType.WAIVER: return '';
        case BenefitType.REBATE: return '';
        case BenefitType.REIMBURSEMENT: return '';
        case BenefitType.VOUCHER: return '';
        case BenefitType.FIXED: return '';
        default: return '';
    }
};

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
