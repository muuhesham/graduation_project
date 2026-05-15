-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'cancelled');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "event_search_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT,
    "metadata" JSONB,
    "embedding" vector(768),

    CONSTRAINT "event_search_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_venueId_idx" ON "Event"("venueId");

-- CreateIndex
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "OrderItem_ticketTypeId_idx" ON "OrderItem"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");
