/*
  Warnings:

  - A unique constraint covering the columns `[taxPayerId,year,type]` on the table `Tax` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Tax_taxPayerId_year_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tax_taxPayerId_year_type_key" ON "public"."Tax"("taxPayerId", "year", "type");
