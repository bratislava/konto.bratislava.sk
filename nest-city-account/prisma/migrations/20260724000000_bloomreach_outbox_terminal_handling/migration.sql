-- CreateEnum
CREATE TYPE "BloomreachCommandName" AS ENUM ('customers', 'customers/events');

-- AlterTable
ALTER TABLE "BloomreachOutbox"
    ALTER COLUMN "commandName" TYPE "BloomreachCommandName" USING "commandName"::"BloomreachCommandName",
    ADD COLUMN "isTerminal" BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill explicit Bloomreach timestamps into commandData of entries queued before the fields existed.
UPDATE "BloomreachOutbox"
SET
    "commandData" = JSONB_SET(
            "commandData",
            '{update_timestamp}',
            TO_JSONB(EXTRACT(EPOCH FROM CASE WHEN "status" = 'COMPLETED' THEN "updatedAt" ELSE "createdAt" END))
                    )
WHERE
    "commandName" = 'customers'
    AND "commandData" -> 'update_timestamp' IS NULL;

UPDATE "BloomreachOutbox"
SET
    "commandData" = JSONB_SET(
            "commandData",
            '{timestamp}',
            TO_JSONB(EXTRACT(EPOCH FROM CASE WHEN "status" = 'COMPLETED' THEN "updatedAt" ELSE "createdAt" END))
                    )
WHERE
    "commandName" = 'customers/events'
    AND "commandData" -> 'timestamp' IS NULL;


-- Prevent a terminal entry from being silently downgraded by a non-terminal write.
CREATE OR REPLACE FUNCTION bloomreach_outbox_prevent_terminal_downgrade()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF old."isTerminal" = TRUE AND new."isTerminal" = FALSE THEN
        RAISE EXCEPTION 'Cannot overwrite terminal BloomreachOutbox entry % with a non-terminal write', old.id
            USING ERRCODE = 'BR001';
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER trg_prevent_bloomreach_outbox_terminal_downgrade
    BEFORE UPDATE
    ON "BloomreachOutbox"
    FOR EACH ROW
EXECUTE FUNCTION bloomreach_outbox_prevent_terminal_downgrade();

-- Prevent inserting a new entry for a key that already has a terminal entry at least as recent
CREATE OR REPLACE FUNCTION bloomreach_outbox_prevent_terminal_override()
    RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    conflicting_id uuid;
BEGIN
    IF new."commandName" IN ('customers', 'customers/events') THEN
        SELECT "id"
        INTO conflicting_id
        FROM
            "BloomreachOutbox"
        WHERE
            "externalId" = new."externalId"
            AND "commandName" = new."commandName"
            AND "status" <> 'FAILED'
            AND "isTerminal" = TRUE
            AND (
                ("commandName" = 'customers' AND ("commandData" ->> 'update_timestamp')::DOUBLE PRECISION
                        >= (new."commandData" ->> 'update_timestamp')::DOUBLE PRECISION)
                        OR ("commandName" = 'customers/events'
                        AND "commandData" ->> 'event_type' = new."commandData" ->> 'event_type'
                        AND "commandData" -> 'properties' ->> 'category'
                            = new."commandData" -> 'properties' ->> 'category'
                        AND ("commandData" ->> 'timestamp')::DOUBLE PRECISION
                            >= (new."commandData" ->> 'timestamp')::DOUBLE PRECISION))
        LIMIT 1;

    ELSE
        RAISE EXCEPTION
            'bloomreach_outbox_prevent_terminal_override: unrecognized commandName "%" - add explicit handling for it before inserting this command',
            new."commandName";
    END IF;

    IF conflicting_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Cannot insert a new BloomreachOutbox entry for external id % (command %): terminal entry % is at least as recent',
            new."externalId", new."commandName", conflicting_id
            USING ERRCODE = 'BR001';
    END IF;

    RETURN new;
END;
$$;

CREATE TRIGGER trg_prevent_bloomreach_outbox_terminal_override
    BEFORE INSERT
    ON "BloomreachOutbox"
    FOR EACH ROW
EXECUTE FUNCTION bloomreach_outbox_prevent_terminal_override();

-- Enforce at most one live "customers" command per account
CREATE UNIQUE INDEX "bloomreach_outbox_customers_pending_key"
    ON "BloomreachOutbox" ("externalId")
    WHERE "commandName" = 'customers' AND "status" = 'PENDING';

-- Enforce at most one live "customers/events" command per (externalId, event_type, category).
CREATE UNIQUE INDEX "bloomreach_outbox_events_pending_key"
    ON "BloomreachOutbox" ("externalId", ("commandData" ->> 'event_type'),
                           ("commandData" -> 'properties' ->> 'category'))
    WHERE "commandName" = 'customers/events' AND "status" = 'PENDING';


-- Create trigger for deleting
CREATE OR REPLACE FUNCTION bloomreach_outbox_delete_non_final_on_terminal()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT new."isTerminal" THEN
        RETURN new;
    END IF;

    IF new."commandName" = 'customers' THEN
        DELETE
        FROM
            "BloomreachOutbox"
        WHERE
            "id" <> new."id"
            AND "externalId" = new."externalId"
            AND "commandName" = 'customers';
    ELSIF new."commandName" = 'customers/events' THEN
        DELETE
        FROM
            "BloomreachOutbox"
        WHERE
            "id" <> new."id"
            AND "externalId" = new."externalId"
            AND "commandName" = 'customers/events'
            AND "commandData" ->> 'event_type' = new."commandData" ->> 'event_type'
            AND "commandData" -> 'properties' ->> 'category'
                    = new."commandData" -> 'properties' ->> 'category';
    ELSE
        RAISE EXCEPTION
            'bloomreach_outbox_delete_non_final_on_terminal: unrecognized commandName "%" - add explicit handling for it before marking this command terminal',
            new."commandName"
            USING ERRCODE = 'BR002';
    END IF;

    RETURN new;
END;
$$;

CREATE TRIGGER trg_delete_non_final_bloomreach_outbox_on_terminal
    AFTER INSERT OR UPDATE
    ON "BloomreachOutbox"
    FOR EACH ROW
    WHEN (new."isTerminal")
EXECUTE FUNCTION bloomreach_outbox_delete_non_final_on_terminal();
