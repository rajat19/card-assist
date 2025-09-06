import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { CREDIT_CARDS } from '../src/data/creditCards';

// Use the same Firebase config values as in src/lib/firebase.ts
const firebaseConfig = {
  apiKey: 'AIzaSyADjIm9FJPn1pdf3RV-teKKjHcHKGqynjU',
  authDomain: 'credit-check-paradox.firebaseapp.com',
  projectId: 'credit-check-paradox',
  storageBucket: 'credit-check-paradox.firebasestorage.app',
  messagingSenderId: '693435546549',
  appId: '1:693435546549:web:bbd82aab1caba65d1437fc',
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const batch = writeBatch(db);
  const cardsCol = collection(db, 'cards');
  const usedSlugs = new Set<string>();

  const slugify = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const uniqueSlug = async (base: string): Promise<string> => {
    let candidate = base || 'card';
    let suffix = 1;
    while (usedSlugs.has(candidate) || (await getDoc(doc(cardsCol, candidate))).exists()) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    usedSlugs.add(candidate);
    return candidate;
  };

  for (const card of CREDIT_CARDS) {
    const base = slugify(card.name);
    const id = await uniqueSlug(base);
    const ref = doc(cardsCol, id);
    const payload = {
      name: card.name,
      bankName: card.bankName,
      cardType: card.cardType,
      description: card.description ?? null,
      benefits: card.benefits.map((b) => ({
        category: b.category,
        type: b.type,
        value: b.value,
        description: b.description ?? null,
        conditions: b.conditions ?? null,
      })),
      feesAndCharges: {
        annual: card.feesAndCharges.annual,
        joining: card.feesAndCharges.joining,
        cashWithdrawal: card.feesAndCharges.cashWithdrawal,
        forex: card.feesAndCharges.forex,
        educationTransaction: card.feesAndCharges.educationTransaction ?? null,
        walletLoad: card.feesAndCharges.walletLoad ?? null,
        utilityBillPayment: card.feesAndCharges.utilityBillPayment ?? null,
        rentTransaction: card.feesAndCharges.rentTransaction ?? null,
        fuelTransaction: card.feesAndCharges.fuelTransaction ?? null,
        other: card.feesAndCharges.other ?? null,
      },
      link: card.link,
      createdAt: serverTimestamp(),
    };
    batch.set(ref, payload, { merge: true });
  }

  await batch.commit();
  console.log(`Seeded ${CREDIT_CARDS.length} cards to Firestore.`);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});


