-- CreateTable
CREATE TABLE "eventRules" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "rule" TEXT NOT NULL,

    CONSTRAINT "eventRules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "eventRules" ADD CONSTRAINT "eventRules_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
