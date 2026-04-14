/*
  Warnings:

  - You are about to drop the column `isApproved` on the `Organizer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactEmail]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactPhone]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateId` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Organizer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('HOBBYIST', 'BUSINESS', 'COMPANY');

-- CreateEnum
CREATE TYPE "OrganizerVerficiationStatus" AS ENUM ('UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Organizer" DROP COLUMN "isApproved",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ADD COLUMN     "countryId" INTEGER NOT NULL,
ADD COLUMN     "coverDisk" TEXT,
ADD COLUMN     "coverPath" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "isContactEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isContactPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "logoDisk" TEXT,
ADD COLUMN     "logoPath" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "stateId" INTEGER NOT NULL,
ADD COLUMN     "status" "OrganizerStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendReason" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "type" "OrganizerType" NOT NULL,
ADD COLUMN     "verificationStatus" "OrganizerVerficiationStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phoneCode" TEXT NOT NULL,
    "taxIdLocale" TEXT,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "flagEmoji" TEXT NOT NULL,
    "isSupported" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "stateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_contactEmail_key" ON "Organizer"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_contactPhone_key" ON "Organizer"("contactPhone");

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
