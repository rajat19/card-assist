# Card Assist

A smart credit card recommendation tool that helps you find the best card for your spending habits. Compare benefits, rewards, and cashback across cards from multiple banks — powered by AI ranking.

🔗 **Live**: [rajat19.github.io/card-assist](https://rajat19.github.io/card-assist/)

## Tech Stack

- **Frontend** — React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend** — Firebase Firestore, Cloud Functions
- **AI** — Gemini API for intelligent card ranking
- **CI/CD** — GitHub Actions → GitHub Pages

## Getting Started

**Prerequisites**: Node.js & npm ([install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```sh
git clone https://github.com/rajat19/card-assist.git
cd card-assist
npm install
npm run dev
```

## Firebase & AI Setup

1. Create a Firebase project with Firestore and Cloud Functions enabled.
2. Copy `.env.example` to `.env` and fill in your Firebase config:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - Optional: `VITE_FIREBASE_FUNCTIONS_REGION` (default `us-central1`)
3. For AI ranking, set a Cloud Functions secret:
   ```sh
   cd functions && npm i
   firebase functions:secrets:set GEMINI_API_KEY
   npm run deploy
   ```

### Firestore Data Model

Collection: `cards`

```
name: string
bankName: string
cardType: 'premium' | 'regular' | 'entry'
annualFee: number
description?: string | null
benefits: Array<{
  category: string
  type: 'cashback' | 'reward_points'
  value: number
  description?: string | null
  conditions?: string | null
}>
createdAt: serverTimestamp
```

### AI Ranking

The client calls the `aiSuggestCards` Cloud Function with the user's query and loaded cards. If Gemini is unavailable, a heuristic fallback ranks cards by max matching benefit value.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run scrape:cards` | Scrape card data from configured sources |
| `npm run add:card` | Add a new card by URL |
| `npm run seed:cards` | Seed cards to Firestore |

## Deployment

Pushes to `main` trigger an automatic build & deploy to GitHub Pages via GitHub Actions.
