-- CreateEnum
CREATE TYPE "HistoricalTaxImportStatus" AS ENUM ('SUCCESS', 'NOT_FOUND', 'FAILED');

-- CreateTable
CREATE TABLE "HistoricalTaxImportAttempt" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxPayerId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "taxType" "TaxType" NOT NULL,
    "status" "HistoricalTaxImportStatus" NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "HistoricalTaxImportAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricalTaxImportAttempt_status_updatedAt_idx" ON "HistoricalTaxImportAttempt"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "HistoricalTaxImportAttempt_taxPayerId_taxType_idx" ON "HistoricalTaxImportAttempt"("taxPayerId", "taxType");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalTaxImportAttempt_taxPayerId_year_taxType_key" ON "HistoricalTaxImportAttempt"("taxPayerId", "year", "taxType");

-- AddForeignKey
ALTER TABLE "HistoricalTaxImportAttempt" ADD CONSTRAINT "HistoricalTaxImportAttempt_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "TaxPayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Populate HistoricalTaxImportAttempt table with existing data
-- Only create records for taxes that exist (mark as SUCCESS)
-- Absence of a record means "not yet attempted"

INSERT INTO "HistoricalTaxImportAttempt" ("taxPayerId", "year", "taxType", "status", "createdAt", "updatedAt")
SELECT DISTINCT
    t."taxPayerId",
    t."year",
    t."type",
    'SUCCESS'::"HistoricalTaxImportStatus",
    t."updatedAt",
    t."updatedAt"
FROM "Tax" t
WHERE t."year" >= 2020  -- Only track from first historical year onwards
ON CONFLICT ("taxPayerId", "year", "taxType") DO NOTHING;
