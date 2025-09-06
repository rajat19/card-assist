import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyADjIm9FJPn1pdf3RV-teKKjHcHKGqynjU",
    authDomain: "credit-check-paradox.firebaseapp.com",
    projectId: "credit-check-paradox",
    storageBucket: "credit-check-paradox.firebasestorage.app",
    messagingSenderId: "693435546549",
    appId: "1:693435546549:web:bbd82aab1caba65d1437fc",
    measurementId: "G-5RK4XD4WSW"
};

let app: FirebaseApp;
let db: Firestore;
let functions: Functions;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getCloudFunctions(): Functions {
  if (!functions) {
    const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
    functions = getFunctions(getFirebaseApp(), region);
  }
  return functions;
}

export { db, functions };
// Eagerly initialize for convenience in modules that import named exports
app = getFirebaseApp();
db = getDb();
functions = getCloudFunctions();


