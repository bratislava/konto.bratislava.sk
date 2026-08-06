-- Backfill explicit Bloomreach timestamps into commandData of entries queued
-- before the fields existed. COMPLETED entries were ingestion-stamped by
-- Bloomreach at delivery, which "updatedAt" approximates; all other entries
-- get their queue time ("createdAt") — PENDING ones will be sent with it.
UPDATE "BloomreachOutbox"
SET "commandData" = jsonb_set(
        "commandData",
        '{update_timestamp}',
        to_jsonb(EXTRACT(EPOCH FROM CASE WHEN "status" = 'COMPLETED' THEN "updatedAt" ELSE "createdAt" END))
    )
WHERE "commandName" = 'customers'
    and "commandData" -> 'update_timestamp' is NULL;

UPDATE "BloomreachOutbox"
SET "commandData" = jsonb_set(
        "commandData",
        '{timestamp}',
        to_jsonb(EXTRACT(EPOCH FROM CASE WHEN "status" = 'COMPLETED' THEN "updatedAt" ELSE "createdAt" END))
    )
WHERE "commandName" = 'customers/events'
    and "commandData" -> 'timestamp' is NULL;
