/*
  Warnings:

  - The values [admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `reviewedBy` column on the `Organizer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('user', 'organizer');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- DropForeignKey
ALTER TABLE "Organizer" DROP CONSTRAINT "Organizer_reviewedBy_fkey";

-- AlterTable
ALTER TABLE "Organizer" DROP COLUMN "reviewedBy",
ADD COLUMN     "reviewedBy" INTEGER;

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRefreshToken" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "AdminRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRefreshToken" ADD CONSTRAINT "AdminRefreshToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
