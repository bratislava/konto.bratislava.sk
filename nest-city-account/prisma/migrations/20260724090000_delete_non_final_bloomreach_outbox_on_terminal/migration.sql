-- Once a BloomreachOutbox entry becomes terminal (an anonymize "customers"
-- command, or one of the consent-reject "customers/events" queued alongside
-- it), it is the customer's final state for that dedup key going forward.
-- Every other entry for the same dedup key - including old
-- COMPLETED/FAILED/SUPERSEDED rows - is now stale and, since commandData
-- holds the pre-anonymization PII (email, name, phone, ...) in plaintext
-- JSON, leaving it in place would mean anonymization never actually happened
-- in our own database even though the customer is anonymized in Bloomreach.
-- This trigger deletes that stale data once a terminal entry lands.
CREATE OR REPLACE FUNCTION delete_non_final_bloomreach_outbox_on_terminal()
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
            'delete_non_final_bloomreach_outbox_on_terminal: unrecognized commandName "%" - add explicit handling for it before marking this command terminal',
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
EXECUTE FUNCTION bloomreach_delete_non_final_outbox_on_terminal();
