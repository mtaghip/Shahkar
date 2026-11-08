-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "discountPence" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'PERCENT',
    "value" INTEGER NOT NULL,
    "minSubtotalPence" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
