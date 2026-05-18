-- CreateEnum
CREATE TYPE "ConsentEnum" AS ENUM ('MARKETING', 'GENERAL');


-- CreateTable
CREATE TABLE "UserConsents"
(
    "id"          uuid          NOT NULL,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"      uuid          NOT NULL,
    "consentType" "ConsentEnum" NOT NULL,
    "isGranted"   BOOLEAN       NOT NULL,

    CONSTRAINT "UserConsents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserConsents_userId_consentType_key"
    ON "UserConsents" ("userId", "consentType");

ALTER TABLE "UserConsents"
    ADD CONSTRAINT "UserConsents_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "UserConsentsHistory"
(
    "id"          uuid          NOT NULL,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"      uuid          NOT NULL,
    "consentType" "ConsentEnum" NOT NULL,
    "isGranted"   BOOLEAN       NOT NULL,

    CONSTRAINT "UserConsentsHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserConsentsHistory_userId_idx" ON "UserConsentsHistory" ("userId");

ALTER TABLE "UserConsentsHistory"
    ADD CONSTRAINT "UserConsentsHistory_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "LegalPersonConsents"
(
    "id"            uuid          NOT NULL,
    "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legalPersonId" uuid          NOT NULL,
    "consentType"   "ConsentEnum" NOT NULL,
    "isGranted"     BOOLEAN       NOT NULL,

    CONSTRAINT "LegalPersonConsents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalPersonConsents_legalPersonId_consentType_key"
    ON "LegalPersonConsents" ("legalPersonId", "consentType");

ALTER TABLE "LegalPersonConsents"
    ADD CONSTRAINT "LegalPersonConsents_legalPersonId_fkey" FOREIGN KEY ("legalPersonId")
        REFERENCES "LegalPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "LegalPersonConsentsHistory"
(
    "id"            uuid          NOT NULL,
    "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legalPersonId" uuid          NOT NULL,
    "consentType"   "ConsentEnum" NOT NULL,
    "isGranted"     BOOLEAN       NOT NULL,

    CONSTRAINT "LegalPersonConsentsHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LegalPersonConsentsHistory_legalPersonId_idx"
    ON "LegalPersonConsentsHistory" ("legalPersonId");

ALTER TABLE "LegalPersonConsentsHistory"
    ADD CONSTRAINT "LegalPersonConsentsHistory_legalPersonId_fkey" FOREIGN KEY ("legalPersonId")
        REFERENCES "LegalPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill UserConsentsHistory from UserGdprData (full audit log preserved).
-- Scope: category=ESBS and type IN (MARKETING, GENERAL); other categories and
-- types we will no longer use stay on UserGdprData for keeping the audit trail.
-- subType=subscribe -> isGranted=true; subType=unsubscribe -> isGranted=false.
INSERT INTO
    "UserConsentsHistory"
    (
        "id", "createdAt", "userId", "consentType", "isGranted"
    )
SELECT gen_random_uuid(),
    "createdAt",
    "userId",
    CASE "type"
        WHEN 'MARKETING' THEN 'MARKETING'::"ConsentEnum"
        WHEN 'GENERAL' THEN 'GENERAL'::"ConsentEnum"
        END,
    CASE "subType"
        WHEN 'subscribe' THEN TRUE
        WHEN 'unsubscribe' THEN FALSE
        END
FROM
    "UserGdprData"
WHERE
    "category" = 'ESBS'
    AND "type" IN ('MARKETING', 'GENERAL')
    AND "subType" IS NOT NULL;


-- Backfill UserConsents with the latest entry per (userId, type).
INSERT INTO
    "UserConsents"
    (
        "id", "createdAt", "userId", "consentType", "isGranted"
    )
SELECT DISTINCT ON ("userId", "type") gen_random_uuid(),
    "createdAt",
    "userId",
    CASE "type"
        WHEN 'MARKETING' THEN 'MARKETING'::"ConsentEnum"
        WHEN 'GENERAL' THEN 'GENERAL'::"ConsentEnum"
        END,
    CASE "subType"
        WHEN 'subscribe' THEN TRUE
        WHEN 'unsubscribe' THEN FALSE
        END
FROM
    "UserGdprData"
WHERE
    "category" = 'ESBS'
    AND "type" IN ('MARKETING', 'GENERAL')
    AND "subType" IS NOT NULL
ORDER BY
    "userId",
    "type",
    "createdAt" DESC
ON CONFLICT ("userId", "consentType") DO NOTHING;


-- Backfill LegalPersonConsentsHistory from LegalPersonGdprData
-- Same as above, but for LegalPerson.
INSERT INTO
    "LegalPersonConsentsHistory"
    (
        "id", "createdAt", "legalPersonId", "consentType", "isGranted"
    )
SELECT gen_random_uuid(),
    "createdAt",
    "legalPersonId",
    CASE "type"
        WHEN 'MARKETING' THEN 'MARKETING'::"ConsentEnum"
        WHEN 'GENERAL' THEN 'GENERAL'::"ConsentEnum"
        END,
    CASE "subType"
        WHEN 'subscribe' THEN TRUE
        WHEN 'unsubscribe' THEN FALSE
        END
FROM
    "LegalPersonGdprData"
WHERE
    "category" = 'ESBS'
    AND "type" IN ('MARKETING', 'GENERAL')
    AND "subType" IS NOT NULL;


-- Backfill LegalPersonConsents with the latest entry per (legalPersonId, type).
INSERT INTO
    "LegalPersonConsents"
    (
        "id", "createdAt", "legalPersonId", "consentType", "isGranted"
    )
SELECT DISTINCT ON ("legalPersonId", "type") gen_random_uuid(),
    "createdAt",
    "legalPersonId",
    CASE "type"
        WHEN 'MARKETING' THEN 'MARKETING'::"ConsentEnum"
        WHEN 'GENERAL' THEN 'GENERAL'::"ConsentEnum"
        END,
    CASE "subType"
        WHEN 'subscribe' THEN TRUE
        WHEN 'unsubscribe' THEN FALSE
        END
FROM
    "LegalPersonGdprData"
WHERE
    "category" = 'ESBS'
    AND "type" IN ('MARKETING', 'GENERAL')
    AND "subType" IS NOT NULL
ORDER BY
    "legalPersonId",
    "type",
    "createdAt" DESC
ON CONFLICT ("legalPersonId", "consentType") DO NOTHING;


-- Mirror UserConsents changes into UserConsentsHistory.
-- Created AFTER the backfills above so historic rows are not duplicated.
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
                "id", "userId", "consentType", "isGranted"
            )
        VALUES
            (
                gen_random_uuid(), new."userId", new."consentType", new."isGranted"
            );
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER trg_user_consents_to_history
    AFTER INSERT OR UPDATE OF "isGranted"
    ON "UserConsents"
    FOR EACH ROW
EXECUTE PROCEDURE user_consents_to_history();


-- Same mirror trigger for LegalPersonConsents.
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
                "id", "legalPersonId", "consentType", "isGranted"
            )
        VALUES
            (
                gen_random_uuid(), new."legalPersonId", new."consentType", new."isGranted"
            );
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER trg_legal_person_consents_to_history
    AFTER INSERT OR UPDATE OF "isGranted"
    ON "LegalPersonConsents"
    FOR EACH ROW
EXECUTE PROCEDURE legal_person_consents_to_history();


-- Make *ConsentsHistory rows immutable: every row is write-once.
-- DELETE is allowed so FK CASCADE on User / LegalPerson removal still works
-- (GDPR right-to-erasure). Same pattern as DeliveryMethodPreferenceHistory.
CREATE OR REPLACE FUNCTION consents_history_reject_modification()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    RAISE EXCEPTION '% rows are immutable; UPDATE is not allowed', tg_table_name;
END;
$$;

CREATE TRIGGER trg_user_consents_history_no_update
    BEFORE UPDATE
    ON "UserConsentsHistory"
    FOR EACH ROW
EXECUTE PROCEDURE consents_history_reject_modification();

CREATE TRIGGER trg_legal_person_consents_history_no_update
    BEFORE UPDATE
    ON "LegalPersonConsentsHistory"
    FOR EACH ROW
EXECUTE PROCEDURE consents_history_reject_modification();
