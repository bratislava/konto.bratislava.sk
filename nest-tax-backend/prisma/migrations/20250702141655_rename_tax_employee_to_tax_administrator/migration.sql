-- Rename table
ALTER TABLE "TaxEmployee" RENAME TO "TaxAdministrator";

-- Drop the existing foreign key constraint
ALTER TABLE "TaxPayer" DROP CONSTRAINT "TaxPayer_taxEmployeeId_fkey";

-- Rename column
ALTER TABLE "TaxPayer" RENAME COLUMN "taxEmployeeId" TO "taxAdministratorId";

-- Add the foreign key constraint with the new name
ALTER TABLE "TaxPayer" ADD CONSTRAINT "TaxPayer_taxAdministratorId_fkey" FOREIGN KEY ("taxAdministratorId") REFERENCES "TaxAdministrator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Rename the primary key constraint
ALTER TABLE "TaxAdministrator" RENAME CONSTRAINT "TaxEmployee_pkey" TO "TaxAdministrator_pkey";
