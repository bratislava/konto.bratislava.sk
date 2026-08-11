-- AlterTable
ALTER TABLE "BloomreachOutbox"
    ADD COLUMN "isTerminal" BOOLEAN NOT NULL DEFAULT FALSE;

-- Prevent a terminal entry (an anonymize "customers" command, or a
-- consent-reject "customers/events" queued alongside one) from being
-- silently downgraded by a non-terminal write. Database-level backstop for
-- the same invariant `mergeCustomerCommandData`/`isAnonymizationCommand`
-- (customers) and `isExistingHigherPriorityEventCommand` (customers/events)
-- enforce in application code.
CREATE OR REPLACE FUNCTION prevent_bloomreach_outbox_terminal_downgrade()
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

-- Prevent inserting a new entry for a key that already has a terminal entry
-- at least as recent
CREATE OR REPLACE FUNCTION prevent_bloomreach_outbox_terminal_override()
    RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    conflicting_id uuid;
BEGIN
    IF new."commandName" in ('customers','customers/events') THEN
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
            'prevent_bloomreach_outbox_terminal_override: unrecognized commandName "%" - add explicit handling for it before inserting this command',
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
EXECUTE FUNCTION prevent_bloomreach_outbox_terminal_override();
