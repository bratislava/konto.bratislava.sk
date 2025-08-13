/*
  Warnings:

  - The `order` column in `TaxInstallment` table is being converted from String to Integer type
  - All existing NULL values will remain NULL during type conversion
  - The column will be populated with order values based on installment text patterns:
    * "prvá splátka" → 1
    * "druhá splátka" → 2
    * "tretia splátka" → 3
    * Other cases → 1 (default)
  - After data population, the column will be set to NOT NULL

*/

-- Convert column type from String to Integer (NULL values convert safely)
ALTER TABLE "TaxInstallment"
    ALTER COLUMN "order" TYPE INTEGER USING "order"::INTEGER;

-- Populate order values based on Slovak installment text patterns
UPDATE "public"."TaxInstallment"
SET "order" = CASE
                  WHEN "text" LIKE '%prvá splátka%' THEN 1
                  WHEN "text" LIKE '%druhá splátka%' THEN 2
                  WHEN "text" LIKE '%tretia splátka%' THEN 3
    -- For texts without installment number specified, default to 1
                  ELSE 1
    END;

-- Make column required now that all rows have valid values
ALTER TABLE "TaxInstallment"
    ALTER COLUMN "order" SET NOT NULL;
