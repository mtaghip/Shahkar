# Shahkar Carpets

A luxury handmade-carpet e-commerce site for the UK market — antique &
collectable pieces alongside contemporary work woven to order. Built from the
[Claude Design](https://claude.ai/design) handoff for **Shahkar Carpets**
("shahkar" is Persian for *masterpiece*), then extended into a full storefront
with an admin, customer accounts, cart and checkout.

**Stack:** Next.js 15 (App Router, Server Actions) · React 19 · TypeScript ·
Prisma + **PostgreSQL** · plain CSS with design tokens.

## Getting started

```bash
npm install
cp .env.example .env      # set DATABASE1_DATABASE_URL_UNPOOLED + AUTH_SECRET
npm run db:migrate        # apply migrations to your Postgres database
npm run db:seed           # load the 9 carpets + the admin account
npm run dev               # http://localhost:3000
```

### A local Postgres

Point `DATABASE1_DATABASE_URL_UNPOOLED` at any Postgres instance. To spin one up locally:

```bash
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'devpassword';"
sudo -u postgres psql -c "CREATE DATABASE shahkar;"
```

That matches the example URL:
`postgresql://postgres:devpassword@localhost:5432/shahkar?schema=public`

### Database scripts

| Script | Does |
| --- | --- |
| `npm run db:migrate` | Create/apply migrations in development (`prisma migrate dev`) |
| `npm run db:deploy` | Apply committed migrations in production (`prisma migrate deploy`) |
| `npm run db:seed` | Load the catalogue + admin account |
| `npm run db:reset` | Drop, re-migrate and re-seed (destructive) |

Production build:

```bash
npm run build && npm run start
```

### Admin

Sign in at **`/account/login`**. In local development the seed creates
`admin@shahkarcarpets.co.uk` / `shahkar-admin` if no admin exists. In production
the admin comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (12+ characters; the dev
default is refused) — see [DEPLOY.md](DEPLOY.md).

Admins land on **/admin** — the store workspace. Recent additions include:

- Shopify-style dashboard with sales, order, product and customer summaries.
- Product catalogue search, SKU, stock, featured/reserved flags and draft,
  active or archived publishing. New products start as drafts, hidden from the shop.
- Upload up to six JPEG, PNG or WebP product photos; they are optimised to WebP
  and the first image is the cover photo.
- Customer CRM with profiles, tags, private notes, consent record, order history
  and paid lifetime spend.
- Searchable order management and payment-status updates. Marking an order paid
  records an offline payment; it does not charge a card.
- One-to-one customer email drafts, review, explicit send confirmation and
  message history. Sending is enabled after the Resend setup below.

Existing orders are linked to matching customer profiles during the admin
migration. Customer profiles are also saved during checkout and registration.
No email is sent merely by creating a profile or draft.

## What's included

| Area | Details |
| --- | --- |
| **Storefront** | Home, collection with **Antique / Contemporary** filters, single carpet, house, journal, contact — all reading live from the database |
| **Cart** | Cookie-backed bag, quantity controls for made-to-order pieces, live count in the header |
| **Checkout** | Guest or signed-in; shipping options with live totals; **Stripe Checkout** when configured, otherwise a "reserve & arrange payment" flow. Reserves unique antique pieces and decrements stock |
| **Payments** | Stripe hosted Checkout + webhook (`/api/webhooks/stripe`) marks orders paid; automatic buyer confirmation email. Optional — works without keys |
| **Shipping & fulfilment** | Flat-rate shipping (UK/Europe/worldwide); admin marks orders fulfilled, adds tracking, and emails the buyer |
| **Refunds & returns** | Admin refund (Stripe refund + restock); customer-initiated returns within the 14-day home trial, processed in admin |
| **Accounts** | Email/password register & login, order history at `/account` |
| **Admin** | Shopify-style admin workspace: dashboard, product publishing/media, customer CRM, orders (payment/fulfilment/refund), returns and email drafts |
| **Auth** | Self-contained — scrypt password hashing + an HMAC-signed session cookie (no third-party auth service) |

## Data model (`prisma/schema.prisma`)

- **User** — `role: "customer" | "admin"`, scrypt `passwordHash`
- **Product** — price in pence, category, stock, publishing status, SKU, flags and photo IDs
- **Customer** — contact details, notes, tags, marketing-consent record and linked orders
- **EmailMessage** — customer-service draft/send history and provider status
- **Media** — optimised product-photo bytes
- **Order** / **OrderItem** — reference, delivery details, customer link, status and line snapshots

Prices are stored as integer **pence** and formatted with `src/lib/money.ts`.

## Structure

```
prisma/
├── schema.prisma        # User, Product, Order, OrderItem
└── seed.ts              # admin user + catalogue
src/
├── app/
│   ├── (storefront)     # /, collection, product, house, journal, contact
│   ├── cart, checkout, order/[id]
│   ├── account          # login, register, order history
│   ├── admin            # dashboard, products, customers, orders, email, settings
│   └── api              # protected photo upload and media delivery
├── components/          # Header, Footer, ProductCard, forms, ImageSlot …
└── lib/
    ├── prisma.ts, auth.ts, cart.ts, money.ts, products.ts, catalogue.ts
    └── actions/         # server actions: auth, cart, checkout, admin, customers, email
```

## Performance

- **Images:** storefront photos go through `next/image` (responsive AVIF/WebP,
  lazy-loaded, fixed aspect ratios so nothing shifts). Published originals are
  served with `Cache-Control: immutable` — a new upload always gets a new id.
- **Caching:** catalogue queries are cached and tagged `products`; every admin
  edit, checkout, cancellation and refund invalidates the tag immediately, so
  prices and availability are never stale. Cart, checkout and admin always read
  live data. (Edits made directly in the database, bypassing the app, can take
  up to five minutes to appear.)
- **Fonts:** self-hosted at build time with `next/font` — no request to Google.
- **Photo storage:** photos live in Postgres, which suits a catalogue of a few
  hundred pieces. When it grows, move them to object storage (e.g. Vercel Blob)
  by replacing `src/app/api/admin/media` and `src/app/api/media/[id]`.

## Checks and CI

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run typecheck`    | TypeScript (`tsc --noEmit`)                                         |
| `npm run lint`         | ESLint with `next/core-web-vitals` + TypeScript rules               |
| `npm run format`       | Prettier (`format:check` to verify without writing)                 |
| `npm test`             | Fast unit/integration checks against an in-memory Postgres (pglite) |
| `npm run test:e2e`     | Browser end-to-end suite (Playwright) against a running build       |

The e2e suite drives the real app: sign-up, cart, checkout (including ten
parallel buyers racing for one antique — exactly one wins), discount codes,
returns, admin edits, photo upload and the gallery lightbox, password reset and
GDPR export/erasure. Run it against a **fresh, seeded** database:

```sh
createdb shahkar_e2e
export DATABASE1_DATABASE_URL_UNPOOLED=postgresql://localhost/shahkar_e2e
npx prisma migrate deploy && npm run db:seed
npm run build && npm start &
npx playwright install chromium   # first time only
npm run test:e2e
```

GitHub Actions (`.github/workflows/ci.yml`) runs all of the above on every push
and pull request, with a Postgres service container.

**Deferred upgrades:** Prisma 7+ requires moving to driver adapters and a
generated client path, and TypeScript 7 (the native compiler) isn't yet
supported by Next.js's type plugin; both stay on Prisma 6.19 / TypeScript 5.9
until that settles.

## Notes on scope

- **Payments (Stripe):** set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in
  Vercel and add a webhook endpoint for `/api/webhooks/stripe`
  (`checkout.session.completed`, `checkout.session.expired`). Checkout then
  redirects to Stripe and the webhook marks orders paid and emails the buyer.
  Without keys, checkout runs the "reserve & arrange payment" flow and the admin
  records payment manually. Refunds are issued from the admin order page.
- **Product photos** are stored in PostgreSQL for a small catalogue. Monitor
  database storage as the catalogue grows; a larger shop should use object
  storage. Removed photos are not automatically cleaned up.
- **Email setup:** verify a sending domain with Resend, then add
  RESEND_API_KEY and EMAIL_FROM in Vercel. EMAIL_REPLY_TO is optional. The app
  records when Resend accepts a message; check Resend for delivery and bounces.
  Newsletter sign-ups are stored with one-click unsubscribe
  (`/newsletter/unsubscribe`) and can be exported as CSV from the admin; send
  campaigns from a dedicated tool.
- **Deploying:** production uses the Vercel Neon integration connection.
  Set a strong AUTH_SECRET (production sign-in is disabled without it),
  ADMIN_EMAIL and ADMIN_PASSWORD in Vercel. npm run vercel-build generates
  Prisma, runs tests and builds before applying the migration and seed.
- **Checks:** see [Checks and CI](#checks-and-ci).
- Copy (est. 1974, the Stow-on-the-Wold showroom, the grandfather-in-Tehran
  story) is placeholder narrative from the design brief.

