-- Copy createdAt from the consent row into the history row instead of
-- relying on DEFAULT CURRENT_TIMESTAMP, so the history timestamp matches

CREATE OR REPLACE FUNCTION user_consents_to_history()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF tg_op = 'INSERT'
            OR new."isGranted" IS DISTINCT FROM old."isGranted"
    THEN
        INSERT INTO
            "UserConsentsHistory"
            (
                "id", "createdAt", "userId", "consentType", "isGranted"
            )
        VALUES
            (
                gen_random_uuid(), new."createdAt", new."userId", new."consentType", new."isGranted"
            );
    END IF;
    RETURN new;
END;
$$;


CREATE OR REPLACE FUNCTION legal_person_consents_to_history()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF tg_op = 'INSERT'
            OR new."isGranted" IS DISTINCT FROM old."isGranted"
    THEN
        INSERT INTO
            "LegalPersonConsentsHistory"
            (
                "id", "createdAt", "legalPersonId", "consentType", "isGranted"
            )
        VALUES
            (
                gen_random_uuid(), new."createdAt", new."legalPersonId", new."consentType", new."isGranted"
            );
    END IF;
    RETURN new;
END;
$$;