-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfilledAt" TIMESTAMP(3),
ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingMethod" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingPence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "trackingCarrier" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trackingNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trackingUrl" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Return_orderId_createdAt_idx" ON "Return"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
