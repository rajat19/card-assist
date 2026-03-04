import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CreditCard } from '@/types/creditcard';
import { toast } from 'sonner';

interface CompareContextType {
    selectedCards: CreditCard[];
    toggleCardToCompare: (card: CreditCard) => void;
    clearCompare: () => void;
    isComparing: (card: CreditCard) => boolean;
    canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
    const [selectedCards, setSelectedCards] = useState<CreditCard[]>([]);

    const toggleCardToCompare = (card: CreditCard) => {
        setSelectedCards((prev) => {
            const isSelected = prev.some((c) => c.name === card.name);

            if (isSelected) {
                return prev.filter((c) => c.name !== card.name);
            }

            if (prev.length >= MAX_COMPARE) {
                toast.error(`You can only compare up to ${MAX_COMPARE} cards at a time.`);
                return prev;
            }

            return [...prev, card];
        });
    };

    const clearCompare = () => {
        setSelectedCards([]);
    };

    const isComparing = (card: CreditCard) => {
        return selectedCards.some((c) => c.name === card.name);
    };

    const canAddMore = selectedCards.length < MAX_COMPARE;

    return (
        <CompareContext.Provider
            value={{
                selectedCards,
                toggleCardToCompare,
                clearCompare,
                isComparing,
                canAddMore,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
