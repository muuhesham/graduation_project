-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'refunded';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wallet" DECIMAL(10,2) NOT NULL DEFAULT 0;
