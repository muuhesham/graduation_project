/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `languagePreference` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - The required column `userId` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ATTENDEE', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CategoryName" AS ENUM ('MUSIC', 'SPORTS', 'THEATER', 'COMEDY', 'EDUCATION', 'TECHNOLOGY', 'HEALTH', 'BUSINESS', 'ART', 'TRAVEL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('CAIRO', 'ALEXANDRIA', 'GIZA', 'LUXOR', 'ASWAN', 'SHARM_EL_SHEIKH', 'HURGHADA', 'TANTA', 'MANSOURA', 'PORT_SAID', 'SUEZ', 'ISMAILIA', 'ZAGAZIG', 'DAMIETTA', 'FAYOUM', 'BENI_SUEF', 'QENA');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'APPLE', 'LOCAL');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'AR');

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "age",
DROP COLUMN "gender",
DROP COLUMN "id",
DROP COLUMN "languagePreference",
DROP COLUMN "location",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- CreateTable
CREATE TABLE "Attendee" (
    "userId" TEXT NOT NULL,
    "providerId" TEXT,
    "authProvider" "AuthProvider" NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "languagePreference" "Language" NOT NULL DEFAULT 'EN',
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "city" "City",

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "userId" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "organization" TEXT NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" TEXT NOT NULL,
    "secondPassword" TEXT NOT NULL,
    "secondEmail" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" "CategoryName" NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendeeFavoriteCategory" (
    "attendeeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "AttendeeFavoriteCategory_pkey" PRIMARY KEY ("attendeeId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeFavoriteCategory" ADD CONSTRAINT "AttendeeFavoriteCategory_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeFavoriteCategory" ADD CONSTRAINT "AttendeeFavoriteCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
