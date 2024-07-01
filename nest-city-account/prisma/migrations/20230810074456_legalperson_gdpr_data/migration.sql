-- CreateTable
CREATE TABLE "LegalPersonGdprData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legalPersonId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subType" TEXT,

    CONSTRAINT "LegalPersonGdprData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LegalPersonGdprData" ADD CONSTRAINT "LegalPersonGdprData_legalPersonId_fkey" FOREIGN KEY ("legalPersonId") REFERENCES "LegalPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
