-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'cancelled');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'active';
