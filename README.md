# Inkwell ✒

A private, minimal notes app. All data stored locally in your browser — nothing leaves your device.

## Deploy to Vercel (recommended)

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy** ✅

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Build for production

```bash
npm run build
# output in /dist
```

## Tech stack
- React 18
- Vite 5
- IndexedDB (local storage — no backend)
- Zero external runtime dependencies
