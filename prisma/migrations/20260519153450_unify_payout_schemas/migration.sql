/*
  Warnings:

  - You are about to drop the column `grossAmount` on the `PayoutItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayoutItem" DROP COLUMN "grossAmount",
ADD COLUMN     "netAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
