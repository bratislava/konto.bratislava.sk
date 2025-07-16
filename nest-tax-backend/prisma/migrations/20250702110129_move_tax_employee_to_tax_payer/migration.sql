-- DropForeignKey
ALTER TABLE "Tax" DROP CONSTRAINT "Tax_taxEmployeeId_fkey";

-- AlterTable
ALTER TABLE "TaxPayer" ADD COLUMN "taxEmployeeId" INTEGER;

-- Update TaxPayer.taxEmployeeId with the taxEmployeeId from the latest Tax
WITH LatestTaxes AS (
  SELECT DISTINCT ON ("taxPayerId") 
    "taxPayerId",
    "taxEmployeeId"
  FROM "Tax"
  WHERE "taxEmployeeId" IS NOT NULL
  ORDER BY "taxPayerId", "createdAt" DESC
)
UPDATE "TaxPayer"
SET "taxEmployeeId" = LatestTaxes."taxEmployeeId"
FROM LatestTaxes
WHERE "TaxPayer".id = LatestTaxes."taxPayerId";

-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "taxEmployeeId";

-- AddForeignKey
ALTER TABLE "TaxPayer" ADD CONSTRAINT "TaxPayer_taxEmployeeId_fkey" FOREIGN KEY ("taxEmployeeId") REFERENCES "TaxEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;