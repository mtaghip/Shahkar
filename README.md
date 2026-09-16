# Shahkar Carpets

A luxury handmade-carpet e-commerce site for the UK market — antique &
collectable pieces alongside contemporary work woven to order. Built from the
[Claude Design](https://claude.ai/design) handoff for **Shahkar Carpets**
("shahkar" is Persian for *masterpiece*), then extended into a full storefront
with an admin, customer accounts, cart and checkout.

**Stack:** Next.js 15 (App Router, Server Actions) · React 19 · TypeScript ·
Prisma + **SQLite** · plain CSS with design tokens. No external services — the
database is a local SQLite file, so it runs anywhere.

## Getting started

```bash
npm install
cp .env.example .env      # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:push           # create the SQLite schema
npm run db:seed           # load the 9 carpets + the admin account
npm run dev               # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

### Admin

After seeding, sign in at **`/account/login`** with the credentials printed by
the seed (defaults, override in `.env`):

- **Email:** `admin@shahkarcarpets.co.uk`
- **Password:** `shahkar-admin`

Admins land on **`/admin`** — add / edit / delete products, feature them on the
homepage, manage stock, and move orders through `pending → paid → cancelled`.
New products appear on the storefront immediately (pages read live from the DB).

## What's included

| Area | Details |
| --- | --- |
| **Storefront** | Home, collection with **Antique / Contemporary** filters, single carpet, house, journal, contact — all reading live from the database |
| **Cart** | Cookie-backed bag, quantity controls for made-to-order pieces, live count in the header |
| **Checkout** | Guest or signed-in; creates a real `Order` (status `PENDING_PAYMENT`) and reserves unique antique pieces |
| **Accounts** | Email/password register & login, order history at `/account` |
| **Admin** | `/admin` dashboard: product CRUD, stock & feature flags, order management, revenue stat |
| **Auth** | Self-contained — scrypt password hashing + an HMAC-signed session cookie (no third-party auth service) |

## Data model (`prisma/schema.prisma`)

- **User** — `role: "customer" | "admin"`, scrypt `passwordHash`
- **Product** — price in pence, category, stock, `featured` / `reserved` flags
- **Order** / **OrderItem** — reference, delivery details, status, line snapshots

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
│   └── admin            # dashboard, products/new, products/[id]/edit, orders
├── components/          # Header, Footer, ProductCard, forms, ImageSlot …
└── lib/
    ├── prisma.ts, auth.ts, cart.ts, money.ts, products.ts, catalogue.ts
    └── actions/         # server actions: auth, cart, checkout, admin
```

## Notes on scope

- **Payment capture is intentionally stubbed** — checkout creates the order and
  reserves the piece; wiring Stripe (or similar) is a drop-in at
  `src/lib/actions/checkout.ts`.
- **Images** are labelled drop-in placeholders (`ImageSlot`) — replace with real
  photography (`next/image`) when available; each carpet carries an image
  caption managed in the admin.
- **SQLite note:** serverless hosts (e.g. Vercel) don't persist file writes, so
  for production deploy against hosted Postgres — switch the Prisma
  `datasource` provider to `postgresql` and point `DATABASE_URL` at it.
- Copy (est. 1974, the Stow-on-the-Wold showroom, the grandfather-in-Tehran
  story) is placeholder narrative from the design brief.
