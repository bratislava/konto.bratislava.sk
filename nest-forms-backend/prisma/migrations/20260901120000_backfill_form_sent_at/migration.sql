-- Backfill formSentAt for historical forms that were already sent (left DRAFT state) but did not have formSentAt set
UPDATE "Forms"
SET "formSentAt" = "updatedAt"
WHERE "formSentAt" IS NULL
AND "state" != 'DRAFT';
