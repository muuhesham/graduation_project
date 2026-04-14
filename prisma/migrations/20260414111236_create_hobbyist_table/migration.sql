-- CreateTable
CREATE TABLE "Hobbyist" (
    "organizerId" TEXT NOT NULL,
    "nationalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hobbyist_pkey" PRIMARY KEY ("organizerId")
);

-- AddForeignKey
ALTER TABLE "Hobbyist" ADD CONSTRAINT "Hobbyist_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
