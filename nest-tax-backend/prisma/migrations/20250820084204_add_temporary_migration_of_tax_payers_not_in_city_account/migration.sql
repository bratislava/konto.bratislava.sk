-- AlterTable
ALTER TABLE "public"."TaxPayer" ADD COLUMN     "removeIfNotInCityAccountMigrated" BOOLEAN NOT NULL DEFAULT false;
