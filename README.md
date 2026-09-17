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
cp .env.example .env      # set DATABASE_URL + AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate        # apply migrations to your Postgres database
npm run db:seed           # load the 9 carpets + the admin account
npm run dev               # http://localhost:3000
```

### A local Postgres

Point `DATABASE_URL` at any Postgres instance. To spin one up locally:

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

After seeding, sign in at **`/account/login`** with the credentials printed by
the seed (defaults, override in `.env`):

- **Email:** `admin@shahkarcarpets.co.uk`
- **Password:** `shahkar-admin`

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
| **Checkout** | Guest or signed-in; creates a real `Order` (status `PENDING_PAYMENT`) and reserves unique antique pieces |
| **Accounts** | Email/password register & login, order history at `/account` |
| **Admin** | Shopify-style admin workspace: dashboard, product publishing/media, customer CRM, orders and email drafts |
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

## Notes on scope

- **Payment capture is intentionally stubbed** — checkout creates the order and
  reserves the piece; wiring Stripe (or similar) is a drop-in at
  `src/lib/actions/checkout.ts`.
- **Product photos** are stored in PostgreSQL for a small catalogue. Monitor
  database storage as the catalogue grows; a larger shop should use object
  storage. Removed photos are not automatically cleaned up.
- **Email setup:** verify a sending domain with Resend, then add
  RESEND_API_KEY and EMAIL_FROM in Vercel. EMAIL_REPLY_TO is optional. The app
  records when Resend accepts a message; check Resend for delivery and bounces.
  Bulk marketing and unsubscribe management are intentionally not included.
- **Deploying:** production uses the Vercel Neon integration connection.
  Set a strong AUTH_SECRET (production sign-in is disabled without it),
  ADMIN_EMAIL and ADMIN_PASSWORD in Vercel. npm run vercel-build generates
  Prisma, runs tests and builds before applying the migration and seed.
- **Checks:** run npm test for isolated migration/backfill, photo, validation,
  email-lock and admin-access checks.
- Copy (est. 1974, the Stow-on-the-Wold showroom, the grandfather-in-Tehran
  story) is placeholder narrative from the design brief.

