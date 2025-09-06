import { Bank, BenefitType, CardType, CreditCard } from '@/types/creditcard';

/*
  Data sources (verify benefits/fees against official pages):
  - Axis Bank MY ZONE Credit Card: https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card
  - LIC Axis Bank Signature Credit Card: https://www.axisbank.com/retail/cards/credit-card/lic-axis-bank-signature-credit-card
  - Flipkart Axis Bank Credit Card: https://www.axisbank.com/retail/cards/credit-card/flipkart-axisbank-credit-card
  - Federal Bank Visa Celesta Credit Card: https://www.federalbank.co.in/visa-celesta-credit-card
  - HDFC Millennia Credit Card: https://www.hdfcbank.com/personal/pay/cards/millennia-cards/millennia-cc-new
  - Swiggy HDFC Bank Credit Card: https://www.hdfcbank.com/personal/pay/cards/credit-cards/swiggy-hdfc-bank-credit-card
  - Tata Neu Infinity HDFC Bank Credit Card: https://www.hdfcbank.com/personal/pay/cards/credit-cards/tata-neu-infinity-hdfc-bank-credit-card
  - ICICI Bank RuPay Credit Card: https://www.icicibank.com/personal-banking/cards/credit-card/rupay-credit-card
  - Amazon Pay ICICI Bank Credit Card: https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card/benefits-features
  - ICICI Bank Platinum Chip Credit Card: https://www.icicibank.com/personal-banking/cards/credit-card/platinum-chip
  - ICICI Bank Sapphiro Credit Card: https://www.icicibank.com/personal-banking/cards/credit-card/sapphiro-credit-card/key-privileges?ITM=nli_cms_CC_choosecard_sapphiro_ccindex_knowmorebtn
  - IDFC FIRST Wealth Credit Card: https://www.idfcfirstbank.com/credit-card/wealth
  - IDFC FIRST WOW Credit Card: https://www.idfcfirstbank.com/credit-card/wow
  - IndusInd Legend Credit Card: https://www.indusind.com/in/en/personal/cards/credit-card/legend-credit-card.html
  - RBL Bank ShopRite Credit Card: https://www.rblbank.com/personal-banking/cards/credit-cards/shoprite-credit-card
  - SBI SimplyCLICK Credit Card: https://www.sbicard.com/en/personal/credit-cards/shopping/simplyclick-sbi-card.page
  - Uni Cards: https://www.uni.cards/

  Confusions / To Verify (placeholder values used where unclear):
  - IDFC FIRST Wealth: Forex markup sometimes advertised as 0%; set to 0% (confirm exact T&Cs). Cash advance fee assumed 0% (confirm).
  - IndusInd Legend: Joining/annual fee varies with LTF offers; set as one-time joining fee with no annual (confirm amounts).
  - Federal Bank Visa Celesta: Premium fees vary by offer; amounts entered as estimates.
  - Tata Neu Infinity HDFC: Joining/annual fee varies by offer; amounts estimated.
  - ICICI RuPay Credit Card: Fees/benefits depend on variant; generic values used.
  - Uni Card: Product benefits/status may vary; placeholder values.
  - Axis MY ZONE: Exact Swiggy/movie benefit structures vary over time; values are indicative.
  - For cards where partner-specific multipliers exist, mapped to closest available categories.
  Updated on: 2025-09-06
*/

export const CREDIT_CARDS: CreditCard[] = [
  {
    name: 'Axis My Zone Credit Card',
    bankName: Bank.AXIS_BANK,
    cardType: CardType.REGULAR,
    feesAndCharges: {
      annual: { value: 500, type: 'fixed' },
      joining: { value: 500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500) of the cash amount' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver for eligible transactions' }
    },
    description: 'Lifestyle card with Swiggy/movie offers and surcharge waivers',
    benefits: [
      { category: 'Swiggy', type: BenefitType.CASHBACK, value: 15, description: 'Swiggy discount; caps/partners apply' },
      { category: 'Entertainment', type: BenefitType.CASHBACK, value: 10, description: 'Movie/entertainment offers (verify exact offer)' },
      { category: 'Shopping', type: BenefitType.CASHBACK, value: 1.5, description: 'Cashback on other spends' }
    ],
    link: 'https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card'
  },
  {
    name: 'LIC Axis Bank Signature Credit Card',
    bankName: Bank.AXIS_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 499, type: 'fixed' },
      joining: { value: 499, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver at select stations' }
    },
    description: 'Signature-tier co-branded card with lifestyle and shopping rewards',
    benefits: [
      { category: 'Shopping', type: BenefitType.REWARD_POINTS, value: 2, description: 'Accelerated rewards on select categories' },
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 2, description: 'Dining privileges' },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.axisbank.com/retail/cards/credit-card/lic-axis-bank-signature-credit-card'
  },
  {
    name: 'Flipkart Axis Bank Credit Card',
    bankName: Bank.AXIS_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 500, type: 'fixed' },
      joining: { value: 500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Best for Flipkart shopping and partner merchants',
    benefits: [
      { category: 'Flipkart', type: BenefitType.CASHBACK, value: 5, description: '5% cashback on Flipkart' },
      { category: 'Uber', type: BenefitType.CASHBACK, value: 4, description: '4% cashback on select partners' },
      { category: 'BookMyShow', type: BenefitType.CASHBACK, value: 4, description: '4% cashback on entertainment partners' },
      { category: 'General', type: BenefitType.CASHBACK, value: 1.5, description: '1.5% cashback on other spends' }
    ],
    link: 'https://www.axisbank.com/retail/cards/credit-card/flipkart-axisbank-credit-card'
  },
  {
    name: 'Federal Bank Visa Celesta Credit Card',
    bankName: Bank.FEDERAL_BANK,
    cardType: CardType.PREMIUM,
    feesAndCharges: {
      annual: { value: 3500, type: 'fixed' },
      joining: { value: 3500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver' }
    },
    description: 'Premium lifestyle and travel card with privileges',
    benefits: [
      { category: 'Travel', type: BenefitType.REWARD_POINTS, value: 4 },
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 4 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.federalbank.co.in/visa-celesta-credit-card'
  },
  {
    name: 'HDFC Millennia Credit Card',
    bankName: Bank.HDFC_BANK,
    cardType: CardType.REGULAR,
    feesAndCharges: {
      annual: { value: 1000, type: 'fixed' },
      joining: { value: 1000, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Cashback on popular online merchants and everyday spends',
    benefits: [
      { category: 'Online Shopping', type: BenefitType.CASHBACK, value: 5, description: 'Accelerated cashback on select online spends' },
      { category: 'Amazon', type: BenefitType.CASHBACK, value: 2.5 },
      { category: 'Flipkart', type: BenefitType.CASHBACK, value: 2.5 },
      { category: 'General', type: BenefitType.CASHBACK, value: 1 }
    ],
    link: 'https://www.hdfcbank.com/personal/pay/cards/millennia-cards/millennia-cc-new'
  },
  {
    name: 'Swiggy HDFC Bank Credit Card',
    bankName: Bank.HDFC_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 500, type: 'fixed' },
      joining: { value: 500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Designed for Swiggy, dining, and popular online spends',
    benefits: [
      { category: 'Swiggy', type: BenefitType.CASHBACK, value: 10, description: '10% back on Swiggy ecosystem' },
      { category: 'Amazon', type: BenefitType.CASHBACK, value: 5 },
      { category: 'Zomato', type: BenefitType.CASHBACK, value: 5 },
      { category: 'General', type: BenefitType.CASHBACK, value: 1 }
    ],
    link: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/swiggy-hdfc-bank-credit-card'
  },
  {
    name: 'Tata Neu Infinity HDFC Bank Credit Card',
    bankName: Bank.HDFC_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 1499, type: 'fixed' },
      joining: { value: 1499, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'NeuCoins on Tata Neu and partner brands',
    benefits: [
      { category: 'Shopping', type: BenefitType.CASHBACK, value: 5, description: 'On Tata Neu ecosystem' },
      { category: 'Groceries', type: BenefitType.CASHBACK, value: 5 },
      { category: 'General', type: BenefitType.CASHBACK, value: 1.5 }
    ],
    link: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/tata-neu-infinity-hdfc-bank-credit-card'
  },
  {
    name: 'ICICI Bank Coral Credit Card',
    bankName: Bank.ICICI_BANK,
    cardType: CardType.ENTRY,
    feesAndCharges: {
      annual: { value: 499, type: 'fixed' },
      joining: { value: 499, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹300)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'RuPay network card with rewards on everyday categories',
    benefits: [
      { category: 'Utilities', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'Shopping', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.icicibank.com/personal-banking/cards/credit-card/rupay-credit-card'
  },
  {
    name: 'Amazon Pay ICICI Credit Card',
    bankName: Bank.ICICI_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed', description: 'Lifetime free' },
      joining: { value: 0, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹300)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Best for Amazon shopping with Prime/non-Prime benefits',
    benefits: [
      { category: 'Amazon', type: BenefitType.CASHBACK, value: 5, description: 'For Prime members on Amazon' },
      { category: 'Amazon', type: BenefitType.CASHBACK, value: 3, description: 'For non-Prime members on Amazon' },
      { category: 'General', type: BenefitType.CASHBACK, value: 1, description: 'All other payments' }
    ],
    link: 'https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card/benefits-features'
  },
  {
    name: 'ICICI Bank Platinum Chip Credit Card',
    bankName: Bank.ICICI_BANK,
    cardType: CardType.ENTRY,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed', description: 'Often LTF; verify variant' },
      joining: { value: 0, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹300)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Entry card with basic rewards and EMV chip security',
    benefits: [
      { category: 'Shopping', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.icicibank.com/personal-banking/cards/credit-card/platinum-chip'
  },
  {
    name: 'ICICI Bank Sapphiro Credit Card',
    bankName: Bank.ICICI_BANK,
    cardType: CardType.REGULAR,
    feesAndCharges: {
      annual: { value: 3500, type: 'fixed' },
      joining: { value: 6500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹300)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Premium travel and lifestyle card with airport lounge access',
    benefits: [
      { category: 'Travel', type: BenefitType.REWARD_POINTS, value: 4 },
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 4 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.icicibank.com/personal-banking/cards/credit-card/sapphiro-credit-card/key-privileges?ITM=nli_cms_CC_choosecard_sapphiro_ccindex_knowmorebtn'
  },
  {
    name: 'IDFC FIRST Wealth Credit Card',
    bankName: Bank.IDFC_FIRST_BANK,
    cardType: CardType.PREMIUM,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed', description: 'Lifetime free' },
      joining: { value: 0, type: 'fixed' },
      cashWithdrawal: { value: 0, type: 'percentage', description: 'No cash advance fee (confirm)' },
      forex: { value: 0, type: 'percentage', description: '0% forex markup (confirm)' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Premium LTF card with travel/dining privileges and low fees',
    benefits: [
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 3 },
      { category: 'Travel', type: BenefitType.REWARD_POINTS, value: 3 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.idfcfirstbank.com/credit-card/wealth'
  },
  {
    name: 'IDFC FIRST WOW Credit Card',
    bankName: Bank.IDFC_FIRST_BANK,
    cardType: CardType.ENTRY,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed', description: 'Lifetime free (secured card)' },
      joining: { value: 0, type: 'fixed' },
      cashWithdrawal: { value: 200, type: 'fixed', description: 'Fixed rate of 200 + GST' },
      forex: { value: 0, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Secured entry card; rewards on everyday categories',
    benefits: [
      { category: 'Shopping', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'Utilities', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.idfcfirstbank.com/credit-card/wow'
  },
  {
    name: 'IndusInd Legend Credit Card',
    bankName: Bank.INDUSIND_BANK,
    cardType: CardType.REGULAR,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed', description: 'No annual; one-time joining fee (confirm)' },
      joining: { value: 9999, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹300)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Premium lifestyle card with dining and travel privileges',
    benefits: [
      { category: 'Dining', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'Travel', type: BenefitType.REWARD_POINTS, value: 2 },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.indusind.com/in/en/personal/cards/credit-card/legend-credit-card.html'
  },
  {
    name: 'RBL Bank ShopRite Credit Card',
    bankName: Bank.RBL_BANK,
    cardType: CardType.REGULAR,
    feesAndCharges: {
      annual: { value: 500, type: 'fixed' },
      joining: { value: 500, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver' }
    },
    description: 'Value card with grocery benefits and fuel surcharge waiver',
    benefits: [
      { category: 'Groceries', type: BenefitType.CASHBACK, value: 5, description: 'Cashback on groceries' },
      { category: 'Fuel', type: BenefitType.CASHBACK, value: 1, description: 'Fuel surcharge waiver benefits' },
      { category: 'General', type: BenefitType.CASHBACK, value: 1 }
    ],
    link: 'https://www.rblbank.com/personal-banking/cards/credit-cards/shoprite-credit-card'
  },
  {
    name: 'SBI SimplyCLICK Credit Card',
    bankName: Bank.SBI_BANK,
    cardType: CardType.ENTRY,
    feesAndCharges: {
      annual: { value: 499, type: 'fixed' },
      joining: { value: 499, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: '2.5% (Min. ₹500)' },
      forex: { value: 3.5, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (caps apply)' }
    },
    description: 'Ideal for online shopping with accelerated reward points',
    benefits: [
      { category: 'Online Shopping', type: BenefitType.REWARD_POINTS, value: 10, description: 'Accelerated RP on partner spends' },
      { category: 'Entertainment', type: BenefitType.REWARD_POINTS, value: 10, description: 'Bonus RP on select categories' },
      { category: 'General', type: BenefitType.REWARD_POINTS, value: 1 }
    ],
    link: 'https://www.sbicard.com/en/personal/credit-cards/shopping/simplyclick-sbi-card.page'
  },
  {
    name: 'Uni Card',
    bankName: Bank.YES_BANK,
    cardType: CardType.COBRAND,
    feesAndCharges: {
      annual: { value: 0, type: 'fixed' },
      joining: { value: 0, type: 'fixed' },
      cashWithdrawal: { value: 2.5, type: 'percentage', description: 'Standard cash advance fee (confirm)' },
      forex: { value: 0, type: 'percentage' },
      fuelTransaction: { value: 1, type: 'percentage', description: '1% surcharge waiver (confirm availability)' }
    },
    description: 'Pay-in-parts/pay-later style product; benefits vary by program',
    benefits: [
      { category: 'Shopping', type: BenefitType.CASHBACK, value: 1 },
      { category: 'General', type: BenefitType.CASHBACK, value: 1 }
    ],
    link: 'https://www.uni.cards/'
  }
];