BEGIN;

-- Helper: validates that the sum of TaxInstallment amounts equals Tax.amount
CREATE OR REPLACE FUNCTION check_tax_installments_sum(p_tax_id INT)
RETURNS VOID AS $$
DECLARE
  v_tax_amount       INT;
  v_installments_sum INT;
BEGIN
  SELECT amount INTO v_tax_amount
  FROM "Tax"
  WHERE id = p_tax_id
  FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RETURN; -- Tax is being deleted in the same transaction, skip check
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_installments_sum
  FROM "TaxInstallment"
  WHERE "taxId" = p_tax_id;

  IF v_installments_sum != v_tax_amount THEN
    RAISE EXCEPTION
      'Sum of TaxInstallment amounts (%) does not match Tax amount (%) for taxId %',
      v_installments_sum, v_tax_amount, p_tax_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for TaxInstallment changes
CREATE OR REPLACE FUNCTION trg_fn_check_installments_sum()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."taxId" != OLD."taxId" AND NEW."taxId" IS NOT NULL AND OLD."taxId" IS NOT NULL THEN
        PERFORM check_tax_installments_sum(NEW."taxId");
        PERFORM check_tax_installments_sum(OLD."taxId");
    ELSE
        PERFORM check_tax_installments_sum(COALESCE(NEW."taxId", OLD."taxId"));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fires after any INSERT/UPDATE/DELETE on TaxInstallment, deferred to end of transaction
CREATE CONSTRAINT TRIGGER trg_check_installments_sum
  AFTER INSERT OR UPDATE OR DELETE ON "TaxInstallment"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION trg_fn_check_installments_sum();

-- Trigger function for Tax.amount changes
CREATE OR REPLACE FUNCTION trg_fn_check_tax_amount_sum()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_tax_installments_sum(NEW.id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fires when Tax.amount is updated, deferred to end of transaction
CREATE CONSTRAINT TRIGGER trg_check_tax_amount_sum
  AFTER UPDATE OF amount ON "Tax"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION trg_fn_check_tax_amount_sum();

COMMIT;
