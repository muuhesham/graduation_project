/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organizer" ADD COLUMN     "stripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_stripeAccountId_key" ON "Organizer"("stripeAccountId");
