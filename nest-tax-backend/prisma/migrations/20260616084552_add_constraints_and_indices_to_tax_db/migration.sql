BEGIN;

-- SPECIFIC constraints, out of prisma:

ALTER TABLE "TaxPayment"
    ADD CONSTRAINT "TaxPayment_amount_positive" CHECK (amount > 0);

ALTER TABLE "TaxPayer"
    ADD CONSTRAINT "TaxPayer_birthNumber_format" CHECK ("birthNumber" ~ '^\d{6}/\d{3,4}$');

ALTER TABLE "TaxInstallment"
    ADD CONSTRAINT "TaxInstallment_order_positive" CHECK ("order" >= 1);

ALTER TABLE "Tax"
    ADD CONSTRAINT "Tax_variableSymbol_numeric" CHECK ("variableSymbol" ~ '^\d+$');

ALTER TABLE "Tax"
    ADD CONSTRAINT "Tax_variableSymbol_max_length" CHECK (length("variableSymbol") <= 10);

-- Config

    -- CreateIndex
    CREATE INDEX "Config_key_idx" ON "Config"("key");

-- TaxAdministrator, TaxPayerTaxAdministrator

    -- AlterTable
    ALTER TABLE "TaxAdministrator" DROP COLUMN "externalId",
    ALTER COLUMN "id" DROP DEFAULT;
    DROP SEQUENCE "TaxEmployee_id_seq";

    -- CreateIndex
    CREATE INDEX "TaxPayerTaxAdministrator_taxAdministratorId_idx" ON "TaxPayerTaxAdministrator"("taxAdministratorId");

-- TaxPayment

    -- CreateIndex
    CREATE INDEX "TaxPayment_taxId_status_idx" ON "TaxPayment"("taxId", "status");

-- TaxPayer 

    -- DropIndex
    DROP INDEX "public"."TaxPayer_uuid_key";

    -- AlterTable
    ALTER TABLE "TaxPayer" DROP COLUMN "uuid";

-- Tax

    -- DropIndex
    DROP INDEX "public"."Tax_taxPayerId_year_type_order_key";

    -- DropIndex
    DROP INDEX "public"."Tax_uuid_key";

    -- DropIndex
    DROP INDEX "public"."Tax_year_lastCheckedPayments_idx";

    -- AlterTable
    ALTER TABLE "Tax" DROP COLUMN "uuid";

    -- CreateIndex
    CREATE INDEX "Tax_lastCheckedPayments_idx" ON "Tax"("lastCheckedPayments");

    -- CreateIndex
    CREATE UNIQUE INDEX "Tax_taxPayerId_type_year_order_key" ON "Tax"("taxPayerId", "type", "year", "order");

COMMIT;