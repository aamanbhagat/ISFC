# IFSCKosh

A directory of **IFSC, MICR & SWIFT codes for every bank branch in India** —
one page per branch (~177,000), built for long-tail SEO and zero wasted crawl
budget. Next.js 16 (App Router) + Turso (libSQL).

Data: Reserve Bank of India, via the public [razorpay/ifsc](https://github.com/razorpay/ifsc)
dataset (MIT). Content is database-driven and refreshed each release — no AI, no
writing.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

With no `TURSO_*` env vars set, the site runs off the **bundled sample dataset**
(`data/sample-branches.json`) — 25 branches across 6 banks, enough to exercise
every page type. Copy `.env.example` → `.env.local` to configure.

## Load the real data (Turso)

```bash
# 1. Create a free Turso DB
turso db create ifsckosh
turso db show ifsckosh --url        # → TURSO_DATABASE_URL
turso db tokens create ifsckosh     # → TURSO_AUTH_TOKEN

# 2. Put both in .env.local, then sync from a dataset file/URL
#    Download CSV/JSON from https://github.com/razorpay/ifsc/releases
IFSC_DATASET_URL=/path/to/IFSC.csv npm run sync
```

`sync` parses CSV or a JSON array of raw records, normalizes them, and rebuilds
the `branches` + `banks` tables with indexes. Idempotent — rerun quarterly.

## Architecture

| Concern | Approach |
| --- | --- |
| Leaf page | `/ifsc/[ifsc]` — the canonical money page. ISR (`revalidate` 7d), top ~2k prerendered, long tail on-demand. |
| Hubs | `/bank`, `/bank/[bank]`, `/bank/[bank]/[state]`, `…/[city]` (+ path-paginated), `/state`, `/state/[state]`. |
| Data | `lib/db.ts` — Turso (libSQL) → bundled sample fallback, deduped with React `cache()`. |
| Structured data | `lib/schema.ts` — `BankOrCreditUnion` + `BreadcrumbList` + `FAQPage` on leaves; `WebSite`+`Organization` on home. |
| Crawl budget | Sharded sitemaps + index (`lib/sitemap-xml.ts`, ≤45k URLs/shard, real `lastmod`); `robots.ts` blocks `/api/` + `?*` traps; self-canonicals; lowercase-IFSC + www/slash redirects; deep pagination `noindex,follow`. |
| Design | "Vault Ledger" — cool paper + emerald (verified) + brass (RBI seal). Signature: the segmented **IFSC Plate** (`components/IfscPlate.tsx`). |

## Deploy

Vercel + Turso. Set `NEXT_PUBLIC_SITE_URL`, `TURSO_DATABASE_URL`,
`TURSO_AUTH_TOKEN` (and optional Search Console verification vars) in the project
env. `next.config.ts` already canonicalises `www`→apex and strips trailing
slashes.
