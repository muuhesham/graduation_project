-- CreateTable
CREATE TABLE "OrganizerFollower" (
    "userId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizerFollower_pkey" PRIMARY KEY ("userId","organizerId")
);

-- AddForeignKey
ALTER TABLE "OrganizerFollower" ADD CONSTRAINT "OrganizerFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerFollower" ADD CONSTRAINT "OrganizerFollower_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
