-- CreateTable
CREATE TABLE "Business" (
    "organizerId" TEXT NOT NULL,
    "commercialRegistration" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("organizerId")
);

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
