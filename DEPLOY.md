# Deploying to Vercel

The app is a Next.js site backed by PostgreSQL (Neon). Vercel hosts the app;
Neon hosts the database.

On every deploy Vercel runs `npm run vercel-build`, which:

1. generates the Prisma client,
2. runs the test suite (`npm test`) — a failing test stops the deploy,
3. builds Next.js,
4. applies database migrations (`prisma migrate deploy`), and
5. runs the seed, which is safe to repeat: it only inserts the catalogue into an
   empty database and never overwrites products you have edited.

If any step fails, the previous deployment keeps serving the site.

## 1. Database

In the Vercel project, open **Storage → Create Database → Neon** and connect it
to the project. Name the connection **`DATABASE1`** — the schema reads the
direct (non-pooled) URL that this integration creates:

| Variable | Set by |
| --- | --- |
| `DATABASE1_DATABASE_URL_UNPOOLED` | Neon integration (automatically) |

If you connect the database under a different name, either rename it or
update `url = env("…")` in `prisma/schema.prisma` to match.

## 2. Required environment variables

Project → **Settings → Environment Variables** (Production, and Preview if you
use preview deploys):

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | a long random string: `openssl rand -base64 32`. Sign-in is disabled in production without it. |
| `ADMIN_EMAIL` | the administrator's email address |
| `ADMIN_PASSWORD` | 12+ characters. Applied on each deploy, so changing it here rotates the admin password. Remove it after the first deploy if you prefer to keep the password only in the database. |

The public development default (`shahkar-admin`) is **never** accepted in
production; a weak value is ignored with a warning and the existing password is
kept.

## 3. Optional integrations

| Feature | Variables | Notes |
| --- | --- | --- |
| Card payments (Stripe) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Add a webhook endpoint `https://<domain>/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`. Without keys, checkout reserves the piece and you arrange payment yourself. |
| Email (Resend) | `RESEND_API_KEY`, `EMAIL_FROM`, optional `EMAIL_REPLY_TO` | Verify your sending domain in Resend first. Needed for order emails and password resets. |
| Site URL | `NEXT_PUBLIC_SITE_URL` | e.g. `https://www.shahkarcarpets.co.uk`. Used for the sitemap, canonical links and social previews. |
| Company details | `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_NUMBER`, `NEXT_PUBLIC_VAT_NUMBER` | Shown in the footer, legal pages and invoices. Leave unset until registered — nothing fictional is shown. |

Redeploy after changing environment variables.

## 4. First sign-in

Open `/account/login`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and you
will land on `/admin`.

## Changing the database schema

Run `npm run db:migrate` locally against a development database, commit the
generated `prisma/migrations/*` folder, and push. The next deploy applies it.
