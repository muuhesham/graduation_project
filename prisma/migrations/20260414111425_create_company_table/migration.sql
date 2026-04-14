-- CreateTable
CREATE TABLE "Company" (
    "organizerId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "officialDocumentsDisk" TEXT,
    "officialDocumentsPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("organizerId")
);

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
