-- CreateEnum
CREATE TYPE "HistoricalTaxImportStatus" AS ENUM ('READY_TO_IMPORT', 'SUCCESS', 'NOT_FOUND', 'FAILED');

-- CreateTable
CREATE TABLE "HistoricalTaxImportAttempt"
(
    "id"           SERIAL                      NOT NULL,
    "createdAt"    TIMESTAMP(3)                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxPayerId"   INTEGER                     NOT NULL,
    "year"         INTEGER                     NOT NULL,
    "taxType"      "TaxType"                   NOT NULL,
    "status"       "HistoricalTaxImportStatus" NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "HistoricalTaxImportAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricalTaxImportAttempt_status_updatedAt_idx" ON "HistoricalTaxImportAttempt" ("status", "updatedAt");

-- CreateIndex
CREATE INDEX "HistoricalTaxImportAttempt_taxPayerId_taxType_idx" ON "HistoricalTaxImportAttempt" ("taxPayerId", "taxType");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalTaxImportAttempt_taxPayerId_year_taxType_key" ON "HistoricalTaxImportAttempt" ("taxPayerId", "year", "taxType");

-- AddForeignKey
ALTER TABLE "HistoricalTaxImportAttempt"
    ADD CONSTRAINT "HistoricalTaxImportAttempt_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "TaxPayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Populate HistoricalTaxImportAttempt table with existing data
-- Only create records for taxes that exist (mark as SUCCESS) or we have them prepared (marked READY_TO_IMPORT)
-- Absence of a record means "not yet attempted"

INSERT INTO "HistoricalTaxImportAttempt" ("taxPayerId", "year", "taxType", "status", "createdAt", "updatedAt")
SELECT DISTINCT t."taxPayerId",
                t."year",
                t."type",
                'SUCCESS'::"HistoricalTaxImportStatus",
                t."updatedAt",
                CASE WHEN t.type = 'KO'::"TaxType" THEN tp."lastUpdatedAtKO" ELSE tp."lastUpdatedAtDZN" END
FROM "Tax" t
         JOIN "TaxPayer" tp ON t."taxPayerId" = tp.id
ON CONFLICT ("taxPayerId", "year", "taxType") DO NOTHING;

INSERT INTO "HistoricalTaxImportAttempt" ("taxPayerId", "year", "taxType", "status", "createdAt", "updatedAt")
SELECT t.id,
       DATE_PART('year', CURRENT_DATE),
       'KO'::"TaxType",
       'READY_TO_IMPORT'::"HistoricalTaxImportStatus",
       NOW(),
       NOW()
FROM "TaxPayer" t
WHERE t."readyToImportKO"
ON CONFLICT DO NOTHING;

INSERT INTO "HistoricalTaxImportAttempt" ("taxPayerId", "year", "taxType", "status", "createdAt", "updatedAt")
SELECT t.id,
       DATE_PART('year', CURRENT_DATE),
       'KO'::"TaxType",
       'READY_TO_IMPORT'::"HistoricalTaxImportStatus",
       NOW(),
       NOW()
FROM "TaxPayer" t
WHERE t."readyToImportKO"
ON CONFLICT DO NOTHING;

-- Clean up old database columns and indexes

-- AlterEnum

-- DropIndex
DROP INDEX "public"."TaxPayer_lastUpdatedAtDZN_idx";

-- DropIndex
DROP INDEX "public"."TaxPayer_lastUpdatedAtKO_idx";

-- DropIndex
DROP INDEX "public"."TaxPayer_readyToImportDZN_idx";

-- DropIndex
DROP INDEX "public"."TaxPayer_readyToImportKO_idx";

-- AlterTable
ALTER TABLE "TaxPayer"
    DROP COLUMN "readyToImportDZN",
    DROP COLUMN "readyToImportKO";