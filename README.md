# VASKY — Step Into Your Style

Online sneaker store. **Next.js (Pages Router) + React + JavaScript + plain CSS.**
No TypeScript, no Tailwind, no App Router.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production check (37 pages)
```

## What works

- **Home** (`/`): hero “STEP INTO YOUR STYLE.”, new arrivals, popular, categories, best sellers, why-Vasky, reviews, newsletter, footer.
- **Shop** (`/shop`): working filters (brand, category, size, price, color, availability) + sorting (featured, newest, price ↑↓, popular) + search box.
- **Categories** (`/category/men|women|kids`), **Search** (`/search`) with suggestions + no-results state.
- **Product page** (`/product/[slug]`): gallery, discount %, size/color/qty selectors, stock guard (sold-out sizes disabled, can't add above stock), related products, reviews.
- **Cart** (`/cart`): qty controls capped at stock, remove, subtotal, persisted in localStorage.
- **Checkout** (`/checkout`): validated form (name/phone/email/address/city), area-based delivery fee, Cash on Delivery. **Prices, stock and totals re-validated server-side** — client totals are never trusted. Promo codes (`WELCOME10` = 10% off, `FREESHIP` = free delivery), validated server-side.
- **Order confirmed** (`/order/[number]`): unique order number (VS-yymmdd-####) + green **Confirm on WhatsApp** button — the order opens pre-written to +961 81 283 591, customer just presses send.
- **WhatsApp alerts**: every order triggers `src/lib/notify.js` — auto-sends via Meta WhatsApp Cloud API when `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` are set, otherwise logs server-side. One-tap wa.me buttons (confirmation page, floating chat button, per-customer admin button) work today with zero setup. See `.env.example`.
- **Reviews**: customers post 1–5★ reviews on product pages (`.data/reviews.json`); size-guide modal, breadcrumbs, details/shipping tabs.
- **Homepage extras**: sale countdown, recently-viewed row, scrolling offer marquee, scroll-reveal animations, floating hero photography.
- **Cart**: free-shipping progress bar. **Admin**: revenue/orders/pending/low-stock stats, WhatsApp-customer button, discount column.
- **Photos**: real product photography (Unsplash CDN, all URLs verified live) with instant SVG fallback — a broken image is never shown.
- **Favorites** (heart everywhere, persisted), **Account** (profile, order tracking, recent orders).
- **Admin** (`/admin`, token gate): orders + status workflow (Pending → … → Delivered/Cancelled), product price/discount/stock editing, delivery areas + fees, customers table.

## Admin access

Token lives in `ADMIN_TOKEN` (see `.env.example`; dev default in `.env.local`).
Open `/admin`, paste the token. It is sent as the `x-admin-token` header —
never baked into client code.

## Payments & security

- **Cash on Delivery** + **Whish Money** (`Admin → Delivery` holds the store's
  Whish wallet number shown at checkout). Whish flow: customer sends from
  their Whish app, pastes the transaction ID, you confirm it in
  `Admin → Orders` before shipping. No card numbers ever touch this site —
  nothing to leak.
- For real card processing you need a licensed gateway (e.g. Stripe/PayTabs/
  Whish Business API) + HTTPS hosting. The order API is already built for
  it: prices, stock, promos and totals are re-validated server-side.
- Protections in place: security headers, order-API rate limiting (12/min/IP),
  admin token auth, input validation everywhere.

## Data (dev-friendly, DB-ready)

- `src/data/products.js` — catalog source of truth (id, slug, brand, price, sizes, colors, category, stock, rating…).
- `src/data/delivery.js` — default areas/fees.
- `src/lib/db.js` — file-JSON store (`.data/`). API routes are the only
  writers, so swapping in Postgres/Mongo later means changing this one file.
- Product images are lightweight inline SVGs (`src/components/ShoeArt.js`) —
  zero downloads, fast on low-end phones.

## Deploy on Vercel (go live)

1. Create an empty repo on GitHub, then:
   ```bash
   git remote add origin https://github.com/YOU/vasky.git
   git push -u origin main   # or master — check with: git branch --show-current
   ```
   (If `git branch` shows no name yet, run `git branch -M main` first.)
2. Go to **vercel.com → Add New → Project → Import** the repo. Framework
   preset: Next.js. No build settings to change.
3. Add a database: **Vercel → Storage → Create Postgres** (free tier is
   plenty), or a free [Neon](https://neon.tech) database. Copy
   `DATABASE_URL` into the project's **Environment Variables**.
4. Add env vars: `ADMIN_TOKEN=<long random secret>`,
   `OWNER_WHATSAPP=96181283591`. Optional later: `WHATSAPP_TOKEN`,
   `WHATSAPP_PHONE_ID`.
5. Deploy. Then migrate your local orders/stock once:
   ```powershell
   $env:DATABASE_URL="postgres://..."
   node scripts/migrate-to-pg.mjs
   ```
6. Open `your-site.vercel.app/admin` and verify the migrated order is there.

Without `DATABASE_URL` the app runs on local JSON files (fine for dev).
With it, Postgres is used automatically — no code changes needed.

## Structure

```
src/pages/        # routes (index, shop, product/[id], cart, checkout, admin…)
src/pages/api/    # products, delivery, orders, admin/*
src/components/   # Layout, ProductCard, ShoeArt
src/data/         # products, delivery config
src/lib/          # store (context), db, server-products, format
src/styles/       # plain CSS, responsive (desktop/tablet/mobile)
```
