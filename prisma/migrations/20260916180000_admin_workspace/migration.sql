ALTER TABLE "Product" ADD COLUMN "imageIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "sku" TEXT NOT NULL DEFAULT '';
CREATE TABLE "Media" ("id" TEXT NOT NULL PRIMARY KEY, "data" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Customer" (
 "id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "name" TEXT NOT NULL,
 "phone" TEXT NOT NULL DEFAULT '', "address" TEXT NOT NULL DEFAULT '', "notes" TEXT NOT NULL DEFAULT '',
 "tags" TEXT NOT NULL DEFAULT '', "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
INSERT INTO "Customer" ("id","email","name")
 SELECT 'import-' || md5(lower("email")), lower("email"), COALESCE("name",'')
 FROM "User" WHERE "role" = 'customer' ON CONFLICT ("email") DO NOTHING;
INSERT INTO "Customer" ("id","email","name","phone","address")
 SELECT DISTINCT ON (lower("email")) 'import-' || md5(lower("email")),lower("email"),"name",COALESCE("phone",''),"address"
 FROM "Order" ORDER BY lower("email"),"createdAt" DESC ON CONFLICT ("email") DO NOTHING;
ALTER TABLE "Order" ADD COLUMN "customerId" TEXT;
UPDATE "Order" SET "customerId" = "Customer"."id" FROM "Customer" WHERE lower("Order"."email") = "Customer"."email";
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "EmailMessage" (
 "id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "recipient" TEXT NOT NULL,
 "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT',
 "providerId" TEXT, "error" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "sentAt" TIMESTAMP(3),
 CONSTRAINT "EmailMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "EmailMessage_customerId_createdAt_idx" ON "EmailMessage"("customerId","createdAt");
