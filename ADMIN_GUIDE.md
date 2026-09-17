# Shahkar store administration

Open `/admin` and sign in with your existing administrator account.

- **Products:** add or edit a product, upload up to six photos (JPEG/PNG/WebP, 3 MB each), set a cover photo, SKU, stock, price and publishing status. New products start as drafts. Active products appear in the shop; drafts and archived products stay hidden. Archive through the publishing-status selector.
- **Customers:** save contact details, private notes, tags and marketing permission. Customers created here do not receive a login or an email. Checkout and registration also save customer records. Existing order/customer records are backfilled by the migration.
- **Orders:** search by reference, name or email, review items and update payment status. Marking an order paid does not charge a card. Cancelling does not restock inventory automatically.
- **Email:** write an individual customer-service email, save a draft, review the recipient and message, then confirm sending. No email is sent by saving a draft.

## Email connection

Verify a sender domain in Resend, then add `RESEND_API_KEY` and `EMAIL_FROM` to the production Vercel environment. Optional: `EMAIL_REPLY_TO`. Redeploy after updating environment variables.

The dashboard distinguishes drafts, sending, provider-accepted, rejected and uncertain outcomes. Provider acceptance is not delivery confirmation. Check Resend for delivery/bounce information. Do not send another copy of an uncertain message until the provider outcome has been checked. Bulk marketing campaigns and unsubscribe handling are not implemented.

## Deployment and checks

`npm test` runs isolated PostgreSQL migration/backfill, validation, image-conversion/storage, email-lock and admin-action access checks. Tests use an in-memory database, not the live store.

`npm run vercel-build` generates the Prisma client, runs tests and compiles Next.js **before** applying the additive database migration and seed. A failed build leaves the currently deployed website in place.

Set a strong `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Vercel. Production login is disabled without `AUTH_SECRET`. Existing catalogue entries are preserved by migrations and seed.

Product images are stored as optimised WebP bytes in PostgreSQL. Monitor database size; larger catalogues should move media to object storage. Draft photos are admin-only. Removed photos can remain in storage; automated orphan cleanup is not implemented.
