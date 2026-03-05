-- CreateEnum
CREATE TYPE "QRStatus" AS ENUM ('valid', 'used', 'expired');

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "codePath" TEXT NOT NULL,
    "codeDisk" TEXT NOT NULL DEFAULT 'local',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "QRStatus" NOT NULL DEFAULT 'valid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_ticketId_key" ON "QrCode"("ticketId");

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
