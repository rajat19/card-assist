import { useState, useMemo } from 'react';
import { Bank, CardType, CreditCard } from '@/types/creditcard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBankIcon } from '@/data/bankIcons';
import { getCategoryIcon } from '@/lib/benefitUtils';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface CardFilters {
    banks: Bank[];
    cardTypes: CardType[];
    joiningFeeRange: [number, number];
    annualFeeRange: [number, number];
    benefitCategories: string[];
}

const BANKS = [
    Bank.AXIS_BANK,
    Bank.FEDERAL_BANK,
    Bank.HDFC_BANK,
    Bank.ICICI_BANK,
    Bank.IDFC_FIRST_BANK,
    Bank.INDUSIND_BANK,
    Bank.RBL_BANK,
    Bank.SBI_BANK,
    Bank.YES_BANK,
];

const CARD_TYPES = [
    { value: CardType.PREMIUM, label: 'Premium' },
    { value: CardType.REGULAR, label: 'Regular' },
    { value: CardType.ENTRY, label: 'Entry' },
    { value: CardType.COBRAND, label: 'Cobrand' },
];

const MAX_JOINING_FEE = 100000;
const MAX_ANNUAL_FEE = 100000;

interface CardFiltersProps {
    filters: CardFilters;
    onFiltersChange: (filters: CardFilters) => void;
    totalCards: number;
    filteredCount: number;
    allCards: CreditCard[];
}

const CardFiltersPanel = ({ filters, onFiltersChange, totalCards, filteredCount, allCards }: CardFiltersProps) => {
    const [expandedSections, setExpandedSections] = useState({
        bank: true,
        cardType: true,
        joiningFee: true,
        annualFee: true,
        benefitCategory: true,
    });

    // Compute top 10 benefit categories by frequency across all cards
    const topBenefitCategories = useMemo(() => {
        const countMap = new Map<string, number>();
        allCards.forEach(card => {
            const cardBenefits = new Set<string>();
            card.benefits.forEach(b => {
                const cat = b.category;
                if (!cardBenefits.has(cat)) {
                    countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
                    cardBenefits.add(cat);
                }
            });
        });
        return [...countMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([cat, count]) => ({ category: cat, count }));
    }, [allCards]);

    const activeFilterCount =
        filters.banks.length +
        filters.cardTypes.length +
        filters.benefitCategories.length +
        (filters.joiningFeeRange[0] > 0 || filters.joiningFeeRange[1] < MAX_JOINING_FEE ? 1 : 0) +
        (filters.annualFeeRange[0] > 0 || filters.annualFeeRange[1] < MAX_ANNUAL_FEE ? 1 : 0);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleBank = (bank: Bank) => {
        const banks = filters.banks.includes(bank)
            ? filters.banks.filter(b => b !== bank)
            : [...filters.banks, bank];
        onFiltersChange({ ...filters, banks });
    };

    const toggleCardType = (type: CardType) => {
        const cardTypes = filters.cardTypes.includes(type)
            ? filters.cardTypes.filter(t => t !== type)
            : [...filters.cardTypes, type];
        onFiltersChange({ ...filters, cardTypes });
    };

    const toggleBenefitCategory = (category: string) => {
        const benefitCategories = filters.benefitCategories.includes(category)
            ? filters.benefitCategories.filter(c => c !== category)
            : [...filters.benefitCategories, category];
        onFiltersChange({ ...filters, benefitCategories });
    };

    const clearAll = () => {
        onFiltersChange({
            banks: [],
            cardTypes: [],
            joiningFeeRange: [0, MAX_JOINING_FEE],
            annualFeeRange: [0, MAX_ANNUAL_FEE],
            benefitCategories: [],
        });
    };

    const formatFee = (value: number) => {
        if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
        return `₹${value}`;
    };

    return (
        <div className="bg-gradient-card rounded-xl border border-border p-5 space-y-5 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-financial-blue" />
                    <span className="font-semibold text-foreground">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-financial-blue text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground h-7 px-2">
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            <p className="text-sm text-muted-foreground">
                Showing {filteredCount} of {totalCards} cards
            </p>

            {/* Bank Filter */}
            <div>
                <button
                    onClick={() => toggleSection('bank')}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                >
                    Bank
                    {expandedSections.bank ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.bank && (
                    <div className="space-y-2 ml-1">
                        {BANKS.map(bank => {
                            const icon = getBankIcon(bank);
                            return (
                                <div key={bank} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`bank-${bank}`}
                                        checked={filters.banks.includes(bank)}
                                        onCheckedChange={() => toggleBank(bank)}
                                    />
                                    <Label htmlFor={`bank-${bank}`} className="flex items-center gap-2 text-sm cursor-pointer font-normal">
                                        {icon && <img src={icon} alt="" className="h-4 w-4 object-contain" />}
                                        {bank}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>


            {/* Benefits On Filter */}
            <div>
                <button
                    onClick={() => toggleSection('benefitCategory')}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                >
                    Benefits On
                    {expandedSections.benefitCategory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.benefitCategory && (
                    <div className="space-y-1.5 ml-1">
                        {topBenefitCategories.map(({ category, count }) => (
                            <div key={category} className="flex items-center gap-2">
                                <Checkbox
                                    id={`benefit-${category}`}
                                    checked={filters.benefitCategories.includes(category)}
                                    onCheckedChange={() => toggleBenefitCategory(category)}
                                />
                                <Label htmlFor={`benefit-${category}`} className="flex items-center gap-2 text-sm cursor-pointer font-normal flex-1">
                                    {getCategoryIcon(category)}
                                    <span>{category}</span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">({count})</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Card Type Filter */}
            <div>
                <button
                    onClick={() => toggleSection('cardType')}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                >
                    Card Type
                    {expandedSections.cardType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.cardType && (
                    <div className="space-y-2 ml-1">
                        {CARD_TYPES.map(({ value, label }) => (
                            <div key={value} className="flex items-center gap-2">
                                <Checkbox
                                    id={`type-${value}`}
                                    checked={filters.cardTypes.includes(value)}
                                    onCheckedChange={() => toggleCardType(value)}
                                />
                                <Label htmlFor={`type-${value}`} className="text-sm cursor-pointer font-normal capitalize">
                                    {label}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Joining Fee Range */}
            <div>
                <button
                    onClick={() => toggleSection('joiningFee')}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                >
                    Joining Fee
                    {expandedSections.joiningFee ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.joiningFee && (
                    <div className="space-y-3 px-1">
                        <Slider
                            value={filters.joiningFeeRange}
                            onValueChange={(val) => onFiltersChange({ ...filters, joiningFeeRange: val as [number, number] })}
                            min={0}
                            max={MAX_JOINING_FEE}
                            step={500}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatFee(filters.joiningFeeRange[0])}</span>
                            <span>{formatFee(filters.joiningFeeRange[1])}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Annual Fee Range */}
            <div>
                <button
                    onClick={() => toggleSection('annualFee')}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                >
                    Annual Fee
                    {expandedSections.annualFee ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.annualFee && (
                    <div className="space-y-3 px-1">
                        <Slider
                            value={filters.annualFeeRange}
                            onValueChange={(val) => onFiltersChange({ ...filters, annualFeeRange: val as [number, number] })}
                            min={0}
                            max={MAX_ANNUAL_FEE}
                            step={500}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatFee(filters.annualFeeRange[0])}</span>
                            <span>{formatFee(filters.annualFeeRange[1])}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardFiltersPanel;
