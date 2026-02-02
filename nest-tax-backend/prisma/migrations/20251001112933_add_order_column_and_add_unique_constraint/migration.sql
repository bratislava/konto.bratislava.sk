-- AlterTable
ALTER TABLE "public"."Tax" ADD COLUMN     "order" INTEGER;

UPDATE "public"."Tax"
SET "order" = 1; 

-- CreateIndex
CREATE UNIQUE INDEX "Tax_taxPayerId_year_type_order_key" ON "public"."Tax"("taxPayerId", "year", "type", "order");

-- Function to set "order" safely with concurrent inserts
CREATE OR REPLACE FUNCTION set_tax_order()
RETURNS TRIGGER AS $$
DECLARE
  type_val INTEGER;
BEGIN
  -- Only assign if not provided
  IF NEW."order" IS NULL THEN
    type_val := CASE WHEN NEW."type" = 'DZN' THEN 1 ELSE 0 END;

    -- Acquire an advisory lock for this taxPayerId, year, type
    PERFORM pg_advisory_xact_lock(
      NEW."taxPayerId"::INTEGER,
      (NEW."year"::INTEGER << 8) | type_val
    );

    -- Compute the next order safely
    SELECT COALESCE(MAX("order"), 0) + 1
    INTO NEW."order"
    FROM "Tax"
    WHERE "taxPayerId" = NEW."taxPayerId"
      AND "year" = NEW."year"
      AND "type" = NEW."type";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tax_order_trigger
BEFORE INSERT OR UPDATE ON "Tax"
FOR EACH ROW
EXECUTE FUNCTION set_tax_order();

-- ADDING NOT NULL CONSTRAINT TO THE ORDER COLUMN

-- Add a check constraint that enforces NOT NULL but won't be detected by Prisma introspection
-- Prisma doesn't automatically convert CHECK constraints to NOT NULL constraints in schema
ALTER TABLE "public"."Tax" 
ADD CONSTRAINT "tax_order_not_null_hidden" 
CHECK ("order" IS NOT NULL);

-- Add a comment to document this hidden constraint
COMMENT ON CONSTRAINT "tax_order_not_null_hidden" ON "public"."Tax" 
IS 'Hidden NOT NULL constraint for order column. Prisma schema keeps it nullable since the value is set by the trigger.';

-- Optional: Add a comment to the column as well
COMMENT ON COLUMN "public"."Tax"."order" 
IS 'Non-null constraint enforced via hidden check constraint. Prisma schema keeps it nullable since the value is set by the trigger.';
