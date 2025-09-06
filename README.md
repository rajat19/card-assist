# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0edf7e54-2195-4ee7-89d1-2da1a92a1cb3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0edf7e54-2195-4ee7-89d1-2da1a92a1cb3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Firebase & AI Setup

1. Create a Firebase project and enable Firestore and Cloud Functions.
2. Copy `.env.example` to `.env` and fill in your Firebase config values (you will provide these):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - Optional: `VITE_FIREBASE_FUNCTIONS_REGION` (default `us-central1`)
3. Optional AI ranking via Gemini: set a Functions secret `GEMINI_API_KEY`.
   - `cd functions && npm i`
   - `firebase functions:secrets:set GEMINI_API_KEY`
   - Deploy functions: `npm run deploy` (requires Firebase CLI initialized for this project)

### Firestore Data Model

Collection: `cards`

Document fields:

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

Client calls `aiSuggestCards` Cloud Function with user query and currently loaded cards.
If Gemini is unavailable, a heuristic fallback ranks cards by max matching benefit value.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0edf7e54-2195-4ee7-89d1-2da1a92a1cb3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
