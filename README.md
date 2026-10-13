# ElectraPips — Website + Trader Portal

React + Vite frontend connected to Supabase (project `mkyckyccjglwkmiwteqy`).

## Run locally
    npm install
    npm run dev        # http://localhost:5173

## Build
    npm run build      # output in dist/

## Structure
- `src/App.jsx` — public website, Trader Portal, pages
- `src/lib/supabaseClient.js` — Supabase client (publishable key only)
- `src/lib/loadSiteData.js` — programs / prices / rules / FAQs from Supabase
- `src/lib/portalData.js` — trader data (RLS-scoped) and view model
- `public/certificates/` — certificate designs (phase1, performance-trader, payout, ...)

## Secrets
No service keys are stored in this repository. Paymos, Resend, and TickerAll keys
live in Supabase Vault and are read only by Edge Functions (service role).
