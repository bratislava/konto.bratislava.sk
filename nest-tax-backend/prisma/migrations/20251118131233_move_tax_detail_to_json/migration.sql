-- 1. Add taxDetails columns to Tax as nullable
ALTER TABLE "Tax"
    ADD COLUMN "taxDetails" jsonb;


-- 2. Migrate data from TaxDetail table to Tax.taxDetails
-- For DZN (real estate tax) - aggregate TaxDetail into propertyDetails
UPDATE "Tax" t
   SET "taxDetails" = JSONB_BUILD_OBJECT(
       'type', 'DZN',
       'taxLand', COALESCE( t."taxLand", 0 ),
       'taxConstructions', COALESCE( t."taxConstructions", 0 ),
       'taxFlat', COALESCE( t."taxFlat", 0 ),
       'propertyDetails', COALESCE(
           ( SELECT JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'type', td."type",
                            'areaType', td."areaType",
                            'area', td."area",
                            'base', td."base",
                            'amount', td."amount"
                        )
                        ORDER BY td."id"
                    )
               FROM "TaxDetail" td
              WHERE td."taxId" = t."id" ),
           '[]'::jsonb ) )
 WHERE t."type" = 'DZN';

-- Step 3: Make column NOT NULL
ALTER TABLE "Tax"
    ALTER COLUMN "taxDetails" SET NOT NULL;

-- Step 4: Remove the old columns from Tax table
ALTER TABLE "Tax"
    DROP COLUMN IF EXISTS "taxLand";

ALTER TABLE "Tax"
    DROP COLUMN IF EXISTS "taxConstructions";

ALTER TABLE "Tax"
    DROP COLUMN IF EXISTS "taxFlat";

-- Step 5: Drop foreign key constraint
ALTER TABLE "TaxDetail"
    DROP CONSTRAINT IF EXISTS "TaxDetail_taxId_fkey";

-- Step 6: Drop table
DROP TABLE IF EXISTS "TaxDetail";

-- Step 7: Drop enums (if they exist)
DROP TYPE IF EXISTS "TaxDetailType";

DROP TYPE IF EXISTS "TaxDetailareaType";