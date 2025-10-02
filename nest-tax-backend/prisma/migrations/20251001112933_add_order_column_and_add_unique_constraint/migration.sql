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
  lock_key BIGINT;
BEGIN
  -- Only assign if not provided
  IF NEW."order" IS NULL THEN
    -- Create a unique bigint key for this (taxPayerId, year, type)
    lock_key := (NEW."taxPayerId"::BIGINT << 32) # NEW."year"::BIGINT # (CASE WHEN NEW."type" = 'DZN' THEN 1 ELSE 2 END);

    -- Acquire an advisory lock for this key
    PERFORM pg_advisory_xact_lock(lock_key);

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
BEFORE INSERT ON "Tax"
FOR EACH ROW
EXECUTE FUNCTION set_tax_order();