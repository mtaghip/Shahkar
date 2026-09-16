# Deploying to Vercel

This app is a Next.js app backed by PostgreSQL. Vercel hosts the app; the
database lives in a hosted Postgres (Neon, Supabase, or Vercel Postgres).

The repo is set up so that **the first deploy creates the schema and seeds the
catalogue + admin account automatically** — via the `vercel-build` script
(`prisma migrate deploy && prisma seed && next build`). You only need to point
it at a database and set two env vars.

## Steps (about 5 minutes)

1. **Import the repo**
   - Go to <https://vercel.com/new>, import `mtaghip/Shahkar`.
   - Framework preset: **Next.js** (auto-detected). Leave build settings as-is —
     Vercel runs the `vercel-build` script automatically.

2. **Create a Postgres database**
   - In the project's **Storage** tab, create a database — **Neon** (the
     "Postgres" option) is the simplest free choice — and **Connect** it to the
     project. Vercel injects the connection string as `DATABASE_URL`.
   - If your provider gives a *pooled* and a *direct* URL, use the **direct /
     non-pooling** URL for `DATABASE_URL` so migrations run cleanly.

3. **Set environment variables** (Project → Settings → Environment Variables)

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | your Postgres connection string (from step 2) |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `ADMIN_EMAIL` | *(optional)* admin login, defaults to `admin@shahkarcarpets.co.uk` |
   | `ADMIN_PASSWORD` | *(optional but recommended)* a strong admin password |

   Set them for **Production** (and Preview if you want preview deploys to work).

4. **Deploy**
   - Trigger a redeploy (Deployments → ⋯ → Redeploy, or push a commit).
   - The build runs migrations and seeds the 9 carpets + the admin account.

5. **Sign in**
   - Visit `/account/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
     (or the defaults). You'll land on `/admin`.
   - **Change the admin password / email** immediately if you used the defaults.

## Notes

- **Re-deploys are safe.** The seed only inserts the catalogue when the product
  table is empty, so it never overwrites products you've edited in `/admin`.
- **Payments** are still stubbed — checkout creates a reserved order; wire a
  provider in `src/lib/actions/checkout.ts`.
- **Migrations**: to change the schema later, run `npm run db:migrate` locally
  against a dev database, commit the generated `prisma/migrations/*`, and push —
  Vercel applies them on the next deploy via `prisma migrate deploy`.
