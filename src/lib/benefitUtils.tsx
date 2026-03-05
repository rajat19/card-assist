import {
    Plane, ShoppingCart, Utensils, Fuel, ShoppingBag,
    Zap, GraduationCap, Shield, Globe, Gift,
    Popcorn, Package, Star, Car,
} from 'lucide-react';
import { BenefitType } from '@/types/creditcard';

const ICON_CLASS = 'h-3 w-3 shrink-0';
const ICON_CLASS_LG = 'h-4 w-4 shrink-0';

export const getCategoryIcon = (category: string, size: 'sm' | 'lg' = 'sm') => {
    const cls = size === 'lg' ? ICON_CLASS_LG : ICON_CLASS;
    const cat = category.toLowerCase();
    if (cat.includes('travel') || cat.includes('international')) return <Plane className={`${cls} text-blue-500`} />;
    if (cat.includes('amazon') || cat.includes('flipkart') || cat.includes('online shopping')) return <ShoppingCart className={`${cls} text-orange-500`} />;
    if (cat.includes('shopping')) return <ShoppingBag className={`${cls} text-pink-500`} />;
    if (cat.includes('dining') || cat.includes('swiggy') || cat.includes('zomato')) return <Utensils className={`${cls} text-red-500`} />;
    if (cat.includes('fuel')) return <Fuel className={`${cls} text-amber-600`} />;
    if (cat.includes('entertainment') || cat.includes('bookmyshow')) return <Popcorn className={`${cls} text-purple-500`} />;
    if (cat.includes('grocer')) return <Package className={`${cls} text-green-600`} />;
    if (cat.includes('utilit')) return <Zap className={`${cls} text-yellow-500`} />;
    if (cat.includes('education')) return <GraduationCap className={`${cls} text-indigo-500`} />;
    if (cat.includes('insurance')) return <Shield className={`${cls} text-teal-500`} />;
    if (cat.includes('uber') || cat.includes('ola')) return <Car className={`${cls} text-gray-600`} />;
    if (cat.includes('lifestyle')) return <Gift className={`${cls} text-rose-500`} />;
    if (cat.includes('adani')) return <Globe className={`${cls} text-emerald-500`} />;
    return <Star className={`${cls} text-financial-blue`} />;
};

export const getBenefitSuffix = (type: BenefitType) => {
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

export const getBenefitTypeLabel = (type: BenefitType) => {
    switch (type) {
        case BenefitType.CASHBACK: return 'Cashback';
        case BenefitType.REWARD_POINTS: return 'Reward Points';
        case BenefitType.MILES: return 'Miles';
        case BenefitType.DISCOUNT: return 'Discount';
        case BenefitType.WAIVER: return 'Waiver';
        case BenefitType.REBATE: return 'Rebate';
        case BenefitType.REIMBURSEMENT: return 'Reimbursement';
        case BenefitType.VOUCHER: return 'Voucher';
        case BenefitType.FIXED: return 'Fixed';
        default: return '';
    }
};
