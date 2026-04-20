-- CreateTable
CREATE TABLE "TaxPayerTaxAdministrator" (
    "taxPayerId" INTEGER NOT NULL,
    "taxAdministratorId" INTEGER NOT NULL,
    "taxType" "TaxType" NOT NULL,

    CONSTRAINT "TaxPayerTaxAdministrator_pkey" PRIMARY KEY ("taxPayerId","taxAdministratorId","taxType")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayerTaxAdministrator_taxPayerId_taxType_key" ON "TaxPayerTaxAdministrator"("taxPayerId", "taxType");

-- Migrate data from TaxPayer.taxAdministratorId to TaxPayerTaxAdministrator with type DZN
INSERT INTO "TaxPayerTaxAdministrator" ("taxPayerId", "taxAdministratorId", "taxType")
SELECT "id", "taxAdministratorId", 'DZN'::"TaxType"
FROM "TaxPayer"
WHERE "taxAdministratorId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "TaxPayerTaxAdministrator" ADD CONSTRAINT "TaxPayerTaxAdministrator_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "TaxPayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPayerTaxAdministrator" ADD CONSTRAINT "TaxPayerTaxAdministrator_taxAdministratorId_fkey" FOREIGN KEY ("taxAdministratorId") REFERENCES "TaxAdministrator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "public"."TaxPayer" DROP CONSTRAINT "TaxPayer_taxAdministratorId_fkey";

-- AlterTable
ALTER TABLE "TaxPayer" DROP COLUMN "taxAdministratorId";
