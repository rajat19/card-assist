export enum UserCardType {
    MASTER_CARD_STANDARD = 'Master Card Standard',
    MASTER_CARD_PLATINUM = 'Master Card Platinum', 
    MASTER_CARD_WORLD = 'Master Card World',
    MASTER_CARD_WORLD_ELITE = 'Master Card World Elite',
    RUPAY_CLASSIC = 'Rupay Classic',
    RUPAY_PLATINIUM = 'Rupay Platinum',
    RUPAY_SELECT = 'Rupay Select',
    VISA_CLASSIC = 'Visa Classic',
    VISA_GOLD = 'Visa Gold',
    VISA_PLATINIUM = 'Visa Platinum',
    VISA_SIGNATURE = 'Visa Signature',
    VISA_INFINITE = 'Visa Infinite',
}

export interface UserCard {
    userId: string;
    cardType: UserCardType;
    cardName: string;
    limit: number;
    spent: number;
    available: number;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
}