-- This migration creates an view for total payments for each tax. That is a sum of already paid amount for that tax.

CREATE OR REPLACE VIEW "TotalPaymentsView" AS
  SELECT "taxId", SUM("amount") AS totalPayments
  FROM "TaxPayment"
  WHERE "status" = 'SUCCESS'
  GROUP BY "taxId";