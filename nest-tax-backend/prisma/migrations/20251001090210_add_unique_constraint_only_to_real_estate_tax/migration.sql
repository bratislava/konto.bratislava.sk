DROP INDEX "public"."Tax_taxPayerId_year_key";

CREATE UNIQUE INDEX unique_dzn_tax_per_year_per_payer
ON "public"."Tax"("taxPayerId", "year")
WHERE type = 'DZN';
