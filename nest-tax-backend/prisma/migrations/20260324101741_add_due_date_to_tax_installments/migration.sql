-- Backfill rules mirror nest-tax-backend/src/tax-definitions/taxDefinitions.ts (installmentDueDates).
BEGIN;

-- 1. Remove obsolete column
ALTER TABLE "TaxInstallment" DROP COLUMN IF EXISTS "text";

-- 2. Add nullable column; filled below, then NOT NULL
ALTER TABLE "TaxInstallment" ADD COLUMN "dueDate" TIMESTAMP(3);

-- 3. Order 1: tax year + Jan 1 (placeholder; not used for NORIS-derived UI rows)
UPDATE "TaxInstallment" AS ti
SET "dueDate" = (t."year"::text || '-01-01')::timestamp
FROM "Tax" AS t
WHERE ti."taxId" = t."id"
  AND ti."order" = 1;

-- 4. DZN: 2nd installment -> installmentDueDates.second (09-01)
UPDATE "TaxInstallment" AS ti
SET "dueDate" = (t."year"::text || '-09-01')::timestamp
FROM "Tax" AS t
WHERE ti."taxId" = t."id"
  AND t."type" = 'DZN'::"TaxType"
  AND ti."order" = 2;

-- 5. DZN: 3rd installment -> installmentDueDates.third (11-01)
UPDATE "TaxInstallment" AS ti
SET "dueDate" = (t."year"::text || '-11-01')::timestamp
FROM "Tax" AS t
WHERE ti."taxId" = t."id"
  AND t."type" = 'DZN'::"TaxType"
  AND ti."order" = 3;

-- 6. KO: for installment order x (x >= 2), calendar slot = (4 - y) + x
--    where y = number of installments for that tax; slot 2/3/4 -> 05-31 / 08-31 / 10-31
--    (e.g. y = 3, x = 2 -> slot 3 -> third date 08-31)
--    No ELSE: unknown (4-y)+x stays NULL so ALTER SET NOT NULL fails loudly.
UPDATE "TaxInstallment" AS ti
SET
  "dueDate" = CASE (4 - ic.y) + ti."order"
    WHEN 2 THEN (t."year"::text || '-05-31')::timestamp
    WHEN 3 THEN (t."year"::text || '-08-31')::timestamp
    WHEN 4 THEN (t."year"::text || '-10-31')::timestamp
  END
FROM "Tax" AS t
INNER JOIN (
  SELECT "taxId", COUNT(*)::int AS y
  FROM "TaxInstallment"
  GROUP BY "taxId"
) AS ic ON ic."taxId" = t."id"
WHERE ti."taxId" = t."id"
  AND t."type" = 'KO'::"TaxType"
  AND ti."order" >= 2;

-- Fails if any row is still NULL (unexpected tax type, order, or KO y/x shape).
ALTER TABLE "TaxInstallment" ALTER COLUMN "dueDate" SET NOT NULL;

COMMIT;
