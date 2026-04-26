-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutItemStatus" AS ENUM ('PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isPaidOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutId" INTEGER;

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "organizerCount" INTEGER NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutItem" (
    "id" SERIAL NOT NULL,
    "payoutId" INTEGER NOT NULL,
    "organizerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutItemStatus" NOT NULL DEFAULT 'PAID',

    CONSTRAINT "PayoutItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
