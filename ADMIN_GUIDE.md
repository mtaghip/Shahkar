# Shahkar store administration

Open `/admin` and sign in with your existing administrator account.

- **Products:** add or edit a product, upload up to six photos (JPEG/PNG/WebP, 3 MB each), set a cover photo, SKU, stock, price and publishing status. New products start as drafts. Active products appear in the shop; drafts and archived products stay hidden. Archive through the publishing-status selector.
- **Customers:** save contact details, private notes, tags and marketing permission. Customers created here do not receive a login or an email. Checkout and registration also save customer records. Existing order/customer records are backfilled by the migration.
- **Products — specifications:** each product has its own specification list (one `Label: value` per line, e.g. `Origin: Heriz, north-west Iran`). The SKU is shown as the reference.
- **Orders:** search by reference, name or email and open **Manage** to: record an offline payment (does not charge a card), cancel an unpaid order (restocks it), refund a paid order (refunds the card through Stripe when it was paid by card, then restocks and emails the customer), and mark it fulfilled with carrier and tracking (emails the customer).
- **Returns:** customers can request a return from their order page within 14 days. Approve, mark received, then refund — or decline — from the order page or the Returns list.
- **Email:** write an individual customer-service email, save a draft, review the recipient and message, then confirm sending. No email is sent by saving a draft.

## Email connection

Verify a sender domain in Resend, then add `RESEND_API_KEY` and `EMAIL_FROM` to the production Vercel environment. Optional: `EMAIL_REPLY_TO`. Redeploy after updating environment variables.

The dashboard distinguishes drafts, sending, provider-accepted, rejected and uncertain outcomes. Provider acceptance is not delivery confirmation. Check Resend for delivery/bounce information. Do not send another copy of an uncertain message until the provider outcome has been checked. Bulk marketing campaigns and unsubscribe handling are not implemented.

## Deployment and checks

`npm test` runs isolated PostgreSQL migration/backfill, validation, image-conversion/storage, email-lock and admin-action access checks. Tests use an in-memory database, not the live store.

`npm run vercel-build` generates the Prisma client, runs tests and compiles Next.js **before** applying the additive database migration and seed. A failed build leaves the currently deployed website in place.

Set a strong `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Vercel. Production login is disabled without `AUTH_SECRET`. Existing catalogue entries are preserved by migrations and seed.

Product images are stored as optimised WebP bytes in PostgreSQL. Monitor database size; larger catalogues should move media to object storage. Draft photos are admin-only. Removed photos can remain in storage; automated orphan cleanup is not implemented.

## Security

- **Sign-in protection:** repeated failed sign-ins are rate-limited per email and per network address (a short wait, then it resets). Registration and password-reset requests are rate-limited too.
- **Forgotten passwords:** customers and admins can use *Forgotten your password?* on the sign-in page. The link is emailed (requires the Resend setup), works once and expires after an hour. Administrator passwords must be at least 12 characters. Changing a password signs that account out on every other device.
- **Activity:** *Admin → Activity* lists the last 200 administrator actions and admin sign-ins (including failed attempts) with who, what and when.
