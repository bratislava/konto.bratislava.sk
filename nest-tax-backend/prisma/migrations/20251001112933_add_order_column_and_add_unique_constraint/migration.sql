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
BEFORE INSERT ON "Tax"
FOR EACH ROW
EXECUTE FUNCTION set_tax_order();