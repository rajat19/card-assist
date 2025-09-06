export enum Bank {
  AXIS_BANK = 'Axis Bank',
  FEDERAL_BANK = 'Federal Bank',
  HDFC_BANK = 'HDFC Bank',
  ICICI_BANK = 'ICICI Bank',
  IDFC_FIRST_BANK = 'IDFC First Bank',
  INDUSIND_BANK = 'IndusInd Bank',
  RBL_BANK = 'RBL Bank',
  SBI_BANK = 'SBI Bank',
  YES_BANK = 'Yes Bank',
  KOTAK_MAHINDRA_BANK = 'Kotak Mahindra Bank',
  BANK_OF_BARODA = 'Bank of Baroda',
}

export enum CardType {
  PREMIUM = 'premium',
  REGULAR = 'regular',
  ENTRY = 'entry',
  COBRAND = 'cobrand',
}

export enum BenefitType {
  CASHBACK = 'cashback',
  REWARD_POINTS = 'reward_points',
}

export interface Benefit {
  category: string;
  type: BenefitType;
  value: number;
  description?: string;
  conditions?: string;
}

export interface FeeItem {
  value: number;
  type: 'fixed' | 'percentage';
  description?: string;
}

export interface FeesAndCharges {
  annual: FeeItem;
  joining: FeeItem;
  cashWithdrawal: FeeItem;
  forex: FeeItem;
  educationTransaction?: FeeItem;
  walletLoad?: FeeItem;
  utilityBillPayment?: FeeItem;
  rentTransaction?: FeeItem;
  fuelTransaction?: FeeItem;
  other?: FeeItem;
}

export interface LoungeItem {
  quantity: number;
  precondition: string;
}
export interface Lounge {
  domestic?: LoungeItem
  international?: LoungeItem
}

export interface CreditCard {
  name: string;
  bankName: Bank;
  benefits: Benefit[];
  feesAndCharges: FeesAndCharges;
  description?: string;
  cardType: CardType;
  link: string;
  lounge?: Lounge;
}

export const CATEGORIES = [
  'Flipkart',
  'Amazon',
  'Swiggy',
  'Zomato',
  'Uber',
  'Ola',
  'BookMyShow',
  'BigBasket',
  'Travel',
  'Fuel',
  'Groceries',
  'Shopping',
  'Online Shopping',
  'Dining',
  'Entertainment',
  'Utilities',
  'General'
] as const;

export type Category = typeof CATEGORIES[number];