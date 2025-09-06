import { collection, getDocs, onSnapshot, query, serverTimestamp, DocumentData, doc, setDoc, getDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { CreditCard, Benefit, FeesAndCharges } from '@/types/creditcard';
import { Bank, BenefitType, CardType } from '@/types/creditcard';

const CARDS_COLLECTION = 'cards';

export type NewCreditCard = CreditCard;

function toBenefitType(value: unknown): BenefitType {
  return value === BenefitType.REWARD_POINTS ? BenefitType.REWARD_POINTS : BenefitType.CASHBACK;
}

function toCardType(value: unknown): CardType {
  switch (value) {
    case CardType.PREMIUM:
    case CardType.ENTRY:
    case CardType.COBRAND:
      return value as CardType;
    default:
      return CardType.REGULAR;
  }
}

function toBank(value: unknown): Bank {
  const v = String(value ?? '');
  const values = Object.values(Bank) as string[];
  return (values.includes(v) ? (v as Bank) : Bank.AXIS_BANK);
}

type FirestoreFeeItem = { value?: unknown; type?: unknown; description?: unknown } | null | undefined;
type FirestoreFees = {
  feesAndCharges?: Partial<FeesAndCharges> & { [k: string]: FirestoreFeeItem };
};

function toFeesAndCharges(data: FirestoreFees): FeesAndCharges {
  const fc = data?.feesAndCharges ?? {};
  const isObj = (x: FirestoreFeeItem): x is { value?: unknown; type?: unknown; description?: unknown } =>
    !!x && typeof x === 'object';
  const num = (v: unknown, fb = 0) => {
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : v == null ? undefined : String(v));
  const feeItem = (item: FirestoreFeeItem, fallbackValue = 0) => ({
    value: num(isObj(item) ? item.value : undefined, fallbackValue),
    type: (isObj(item) && item.type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
    description: str(isObj(item) ? item.description : undefined),
  });
  return {
    annual: feeItem(fc.annual, 0),
    joining: feeItem(fc.joining, 0),
    cashWithdrawal: feeItem(fc.cashWithdrawal, 0),
    forex: feeItem(fc.forex, 0),
    educationTransaction: fc.educationTransaction ? feeItem(fc.educationTransaction) : undefined,
    walletLoad: fc.walletLoad ? feeItem(fc.walletLoad) : undefined,
    utilityBillPayment: fc.utilityBillPayment ? feeItem(fc.utilityBillPayment) : undefined,
    rentTransaction: fc.rentTransaction ? feeItem(fc.rentTransaction) : undefined,
    fuelTransaction: fc.fuelTransaction ? feeItem(fc.fuelTransaction) : undefined,
    other: fc.other ? feeItem(fc.other) : undefined,
  };
}

function mapDocToCreditCard(docWrap: { id: string; data: () => DocumentData }): CreditCard {
  const data = docWrap.data();
  const benefits: Benefit[] = Array.isArray(data.benefits)
    ? data.benefits.map((b: Record<string, unknown>) => ({
        category: String(b.category ?? ''),
        type: toBenefitType(b.type),
        value: Number(b.value ?? 0),
        description: b.description ? String(b.description) : undefined,
        conditions: b.conditions ? String(b.conditions) : undefined,
      }))
    : [];

  return {
    name: String(data.name ?? ''),
    bankName: toBank(data.bankName),
    cardType: toCardType(data.cardType),
    description: data.description ? String(data.description) : undefined,
    benefits,
    feesAndCharges: toFeesAndCharges(data),
    link: String(data.link ?? '#'),
    lounge: data.lounge && typeof data.lounge === 'object' ? {
      domestic: data.lounge.domestic ? {
        quantity: Number(data.lounge.domestic.quantity ?? 0),
        precondition: String(data.lounge.domestic.precondition ?? ''),
      } : undefined,
      international: data.lounge.international ? {
        quantity: Number(data.lounge.international.quantity ?? 0),
        precondition: String(data.lounge.international.precondition ?? ''),
      } : undefined,
    } : undefined,
  };
}

export async function getAllCards(): Promise<CreditCard[]> {
  const db = getDb();
  const q = query(collection(db, CARDS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDocToCreditCard({ id: d.id, data: () => d.data() }));
}

export function subscribeToCards(callback: (cards: CreditCard[]) => void): Unsubscribe {
  const db = getDb();
  const q = query(collection(db, CARDS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const cards = snapshot.docs.map((d) => mapDocToCreditCard({ id: d.id, data: () => d.data() }));
    callback(cards);
  });
}

export async function addCard(newCard: NewCreditCard): Promise<string> {
  const db = getDb();
  const payload = {
    name: newCard.name,
    bankName: newCard.bankName,
    cardType: newCard.cardType,
    description: newCard.description ?? null,
    benefits: newCard.benefits.map((b) => ({
      category: b.category,
      type: b.type,
      value: b.value,
      description: b.description ?? null,
      conditions: b.conditions ?? null,
    })),
    feesAndCharges: {
      annual: newCard.feesAndCharges.annual,
      joining: newCard.feesAndCharges.joining,
      cashWithdrawal: newCard.feesAndCharges.cashWithdrawal,
      forex: newCard.feesAndCharges.forex,
      educationTransaction: newCard.feesAndCharges.educationTransaction ?? null,
      walletLoad: newCard.feesAndCharges.walletLoad ?? null,
      utilityBillPayment: newCard.feesAndCharges.utilityBillPayment ?? null,
      rentTransaction: newCard.feesAndCharges.rentTransaction ?? null,
      fuelTransaction: newCard.feesAndCharges.fuelTransaction ?? null,
      other: newCard.feesAndCharges.other ?? null,
    },
    link: newCard.link,
    lounge: newCard.lounge ? {
      domestic: newCard.lounge.domestic ?? null,
      international: newCard.lounge.international ?? null,
    } : null,
    createdAt: serverTimestamp(),
  };

  // Use name-based slug as document ID for readability
  const slug = newCard.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'card';

  let id = slug;
  let suffix = 1;
  const colRef = collection(db, CARDS_COLLECTION);
  while ((await getDoc(doc(colRef, id))).exists()) {
    suffix += 1;
    id = `${slug}-${suffix}`;
  }
  await setDoc(doc(colRef, id), payload, { merge: true });
  return id;
}

export async function updateCard(updated: NewCreditCard): Promise<void> {
  const db = getDb();
  const colRef = collection(db, CARDS_COLLECTION);
  const slug = updated.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'card';

  const payload = {
    name: updated.name,
    bankName: updated.bankName,
    cardType: updated.cardType,
    description: updated.description ?? null,
    benefits: updated.benefits.map((b) => ({
      category: b.category,
      type: b.type,
      value: b.value,
      description: b.description ?? null,
      conditions: b.conditions ?? null,
    })),
    feesAndCharges: {
      annual: updated.feesAndCharges.annual,
      joining: updated.feesAndCharges.joining,
      cashWithdrawal: updated.feesAndCharges.cashWithdrawal,
      forex: updated.feesAndCharges.forex,
      educationTransaction: updated.feesAndCharges.educationTransaction ?? null,
      walletLoad: updated.feesAndCharges.walletLoad ?? null,
      utilityBillPayment: updated.feesAndCharges.utilityBillPayment ?? null,
      rentTransaction: updated.feesAndCharges.rentTransaction ?? null,
      fuelTransaction: updated.feesAndCharges.fuelTransaction ?? null,
      other: updated.feesAndCharges.other ?? null,
    },
    link: updated.link,
    lounge: updated.lounge ? {
      domestic: updated.lounge.domestic ?? null,
      international: updated.lounge.international ?? null,
    } : null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(colRef, slug), payload, { merge: true });
}


