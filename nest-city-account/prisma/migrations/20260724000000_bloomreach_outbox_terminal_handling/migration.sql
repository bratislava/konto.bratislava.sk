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

-- Backfill the `kind` discriminator into commandData of entries queued before the field existed.
UPDATE "BloomreachOutbox"
SET
    "commandData" = JSONB_SET("commandData", '{kind}', '"customer"')
WHERE
    "commandName" = 'customers'
    AND "commandData" -> 'kind' IS NULL;

UPDATE "BloomreachOutbox"
SET
    "commandData" = JSONB_SET("commandData", '{kind}', '"event"')
WHERE
    "commandName" = 'customers/events'
    AND "commandData" -> 'kind' IS NULL;


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
                ("commandName" = 'customers')
                        OR ("commandName" = 'customers/events'
                        AND "commandData" ->> 'event_type' = new."commandData" ->> 'event_type'
                        AND "commandData" -> 'properties' ->> 'category'
                            = new."commandData" -> 'properties' ->> 'category'))
        LIMIT 1;

    ELSE
        RAISE EXCEPTION
            'bloomreach_outbox_prevent_terminal_override: unrecognized commandName "%" - add explicit handling for it before inserting this command',
            new."commandName"
            USING ERRCODE = 'BR002';
    END IF;

    IF conflicting_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Cannot insert a new BloomreachOutbox entry for external id % (command %): entry % is already terminal',
            new."externalId", new."commandName", conflicting_id
            USING ERRCODE = 'BR003';
    END IF;

    RETURN new;
END;
$$;

CREATE TRIGGER trg_prevent_bloomreach_outbox_terminal_override
    BEFORE INSERT
    ON "BloomreachOutbox"
    FOR EACH ROW
EXECUTE FUNCTION bloomreach_outbox_prevent_terminal_override();

-- Enforce at most one live "customers" command per account. This unique index is the actual
-- DB-level enforcement/backstop - lockTransactionWithKey is what normally keeps it from ever being hit.
CREATE UNIQUE INDEX "bloomreach_outbox_customers_pending_key"
    ON "BloomreachOutbox" ("externalId")
    WHERE "commandName" = 'customers' AND "status" = 'PENDING';
-- Enforce at most one live "customers/events" command per (externalId, event_type, category).

-- Same relationship as above: this unique index is the actual enforcement/backstop.
CREATE UNIQUE INDEX "bloomreach_outbox_events_pending_key"
    ON "BloomreachOutbox" ("externalId", ("commandData" ->> 'event_type'),
                           ("commandData" -> 'properties' ->> 'category'))
    WHERE "commandName" = 'customers/events' AND "status" = 'PENDING';

-- Diagnostic only, not additional enforcement. This is a BEFORE INSERT trigger, so on a conflict it runs and raises
-- BR004 before the row insert ever reaches the unique index above - the index is never evaluated on that path, so this
-- isn't two mechanisms redundantly enforcing the same insert; it's the one that runs first, replacing what would
-- otherwise be a bare, ambiguous unique-constraint violation. The index remains the actual backstop (this check has no
-- comparable atomicity guarantee on its own). The only real added cost is this trigger's own lookup running once per
-- insert attempt, successful or not. Firing at all always means lockTransactionWithKey failed to prevent a race - alert.
--
-- Empirical note (verified against a real Postgres instance, Prisma 7.8.0 + @prisma/adapter-pg, by disabling this
--  trigger so the index below caused Prisma to raise P2002 directly):
-- Prisma did NOT populate the documented `meta.target` for this index. Instead it fell back to
-- `meta.driverAdapterError.cause.constraint.fields`, containing: ["\"externalId\""]
-- A clean single field name here, since this index has no functional/JSON-path component - matching on it directly in
-- the app code would actually have been viable for this particular index although it would be using an undocumented
-- behaviour. It's the sibling events index below where that stops being true. Please see its own note.
CREATE OR REPLACE FUNCTION bloomreach_outbox_prevent_duplicate_pending_customer()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF new."commandName" = 'customers' AND EXISTS
        (SELECT 1
         FROM
             "BloomreachOutbox"
         WHERE
             "externalId" = new."externalId"
             AND "commandName" = 'customers'
             AND "status" = 'PENDING') THEN
        RAISE EXCEPTION
            'Duplicate PENDING customers command for external id % - lockTransactionWithKey should have prevented this',
            new."externalId"
            USING ERRCODE = 'BR004';
    END IF;

    RETURN new;
END;
$$;

CREATE TRIGGER trg_prevent_duplicate_pending_customer
    BEFORE INSERT
    ON "BloomreachOutbox"
    FOR EACH ROW
EXECUTE FUNCTION bloomreach_outbox_prevent_duplicate_pending_customer();



-- Diagnostic only, not additional enforcement - see bloomreach_outbox_prevent_duplicate_pending_customer above for why
-- running before the unique index isn't wasted duplicate work. Mirrors the events pending-key index so a violation
-- raises BR005 instead of an ambiguous unique-constraint error.
-- Firing at all always means lockTransactionWithKey failed - alert.
--
-- Empirical note (same test session as the customer trigger's note above, same method - disabling this trigger and
-- letting the events pending-key index raise P2002 directly): the resulting
-- `meta.driverAdapterError.cause.constraint .fields` was:
--   ["\"externalId\"", "(\"commandData\" ->> 'event_type'::text"]
-- The second entry is a malformed/partial fragment of the index's expression. Missing its closing parenthesis, an
-- inline type cast baked in mid-string - not a stable field name, and not something worth pattern-matching in the app
-- code. This is the concrete, measured reason isDuplicatePendingEventError (BR005) exists instead of inspecting the raw
-- P2002 here.
CREATE OR REPLACE FUNCTION bloomreach_outbox_prevent_duplicate_pending_event()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF new."commandName" = 'customers/events' AND EXISTS
        (SELECT 1
         FROM
             "BloomreachOutbox"
         WHERE
             "externalId" = new."externalId"
             AND "commandName" = 'customers/events'
             AND "status" = 'PENDING'
             AND "commandData" ->> 'event_type' = new."commandData" ->> 'event_type'
             AND "commandData" -> 'properties' ->> 'category'
                     = new."commandData" -> 'properties' ->> 'category') THEN
        RAISE EXCEPTION
            'Duplicate PENDING customers/events command for external id % - lockTransactionWithKey should have prevented this',
            new."externalId"
            USING ERRCODE = 'BR005';
    END IF;

    RETURN new;
END;
$$;

CREATE TRIGGER trg_prevent_duplicate_pending_event
    BEFORE INSERT
    ON "BloomreachOutbox"
    FOR EACH ROW
EXECUTE FUNCTION bloomreach_outbox_prevent_duplicate_pending_event();


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
