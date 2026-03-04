import {
    Plane, ShoppingCart, Utensils, Fuel, ShoppingBag,
    Zap, GraduationCap, Shield, Globe, Gift, Bike,
    Popcorn, Package, Star, Check,
} from 'lucide-react';
import { Perk } from '@/types/creditcard';

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    const cls = 'h-3.5 w-3.5 shrink-0';
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
    if (cat.includes('uber') || cat.includes('ola')) return <Bike className={`${cls} text-gray-600`} />;
    if (cat.includes('lifestyle')) return <Gift className={`${cls} text-rose-500`} />;
    if (cat.includes('adani')) return <Globe className={`${cls} text-emerald-500`} />;
    return <Check className={`${cls} text-financial-blue`} />;
};

const PerkItemIcon = ({ perk }: { perk: Perk }) => {
    return (
        <div className="mt-0.5">
            {getCategoryIcon(perk.category)}
        </div>
    );
};

export default PerkItemIcon;