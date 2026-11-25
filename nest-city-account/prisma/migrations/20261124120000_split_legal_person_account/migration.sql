-- #1801 Split company (LegalPerson) from Cognito login (LegalPersonAccount) and store
-- representatives (konatelia) as PhysicalEntity linked through LegalPersonRepresentation.
--
-- The old "LegalPerson" table is RENAMED to "LegalPersonAccount" (data, consents, GDPR data and
-- login clients are kept), then a new "LegalPerson" company table is created and backfilled
-- from the distinct IČOs of the accounts.
--
-- Department accounts (runbook vytvorenie-konta-pre-zamestnancov.md) are recognised by a
-- non-numeric IČO (e.g. 'Bratislava-OKM', 'BA-SNB') and become kind DEPARTMENT without any
-- representative. Every other company is migrated as PO; FO_P is corrected from the Cognito
-- account type on the next upsert of any of its accounts (see UserDataSubservice).
--
-- The account's own "ico" / "birthNumber" columns are dropped at the end: the IČO now lives on
-- LegalPerson and the birth number on the representative's PhysicalEntity. Department accounts
-- lose their 'BA-rodne-cislo-N' placeholder, which only existed to satisfy the old
-- (ico, birthNumber) unique key.

-- =============================================================================================
-- 0. Pre-flight: refuse to migrate data we cannot classify safely
-- =============================================================================================
DO
$$
    DECLARE
        bad_count INTEGER;
    BEGIN
        -- A real (numeric) IČO paired with a department placeholder birth number.
        SELECT count(*)
        INTO bad_count
        FROM "LegalPerson"
        WHERE "ico" ~ '^[0-9]+(_[0-9]+)?$'
          AND "birthNumber" LIKE 'BA-rodne-cislo-%';
        IF bad_count > 0 THEN
            RAISE EXCEPTION '#1801: % LegalPerson rows have a numeric ico with a department birthNumber placeholder', bad_count;
        END IF;

        -- birthNumber without ico cannot be linked to any company.
        SELECT count(*)
        INTO bad_count
        FROM "LegalPerson"
        WHERE "ico" IS NULL
          AND "birthNumber" IS NOT NULL;
        IF bad_count > 0 THEN
            RAISE EXCEPTION '#1801: % LegalPerson rows have birthNumber but no ico', bad_count;
        END IF;

        -- The new unique key is (company, representative). Two accounts of the same company whose
        -- birth numbers only differ by the slash would map to the same representative.
        SELECT count(*)
        INTO bad_count
        FROM (SELECT 1
              FROM "LegalPerson"
              WHERE "ico" ~ '^[0-9]+(_[0-9]+)?$'
                AND "birthNumber" IS NOT NULL
              GROUP BY "ico", replace("birthNumber", '/', '')
              HAVING count(*) > 1) d;
        IF bad_count > 0 THEN
            RAISE EXCEPTION '#1801: % (ico, birth number ignoring slash) pairs have more than one LegalPerson account', bad_count;
        END IF;
    END
$$;

-- =============================================================================================
-- 1. Enums
-- =============================================================================================
CREATE TYPE "LegalPersonKindEnum" AS ENUM ('PO', 'FO_P', 'DEPARTMENT');
CREATE TYPE "LegalPersonRepresentationTypeEnum" AS ENUM ('STATUTORY_BODY', 'OWNER');

-- =============================================================================================
-- 2. LegalPerson -> LegalPersonAccount (rename, keep data)
-- =============================================================================================
ALTER TABLE "LegalPerson" RENAME TO "LegalPersonAccount";
ALTER TABLE "LegalPersonAccount" RENAME CONSTRAINT "LegalPerson_pkey" TO "LegalPersonAccount_pkey";
ALTER INDEX "LegalPerson_email_key" RENAME TO "LegalPersonAccount_email_key";
ALTER INDEX "LegalPerson_externalId_key" RENAME TO "LegalPersonAccount_externalId_key";
-- Replaced by the (legalPersonId, physicalEntityId) unique key in section 6.
DROP INDEX "LegalPerson_ico_birthNumber_key";

ALTER TABLE "LegalPersonAccount"
    ADD COLUMN "legalPersonId"    UUID,
    ADD COLUMN "physicalEntityId" UUID;

-- Child tables: legalPersonId -> legalPersonAccountId. FKs follow the table rename automatically.
ALTER TABLE "LegalPersonConsents" RENAME COLUMN "legalPersonId" TO "legalPersonAccountId";
ALTER TABLE "LegalPersonConsents" RENAME CONSTRAINT "LegalPersonConsents_legalPersonId_fkey" TO "LegalPersonConsents_legalPersonAccountId_fkey";
ALTER INDEX "LegalPersonConsents_legalPersonId_consentType_key" RENAME TO "LegalPersonConsents_legalPersonAccountId_consentType_key";

ALTER TABLE "LegalPersonConsentsHistory" RENAME COLUMN "legalPersonId" TO "legalPersonAccountId";
ALTER TABLE "LegalPersonConsentsHistory" RENAME CONSTRAINT "LegalPersonConsentsHistory_legalPersonId_fkey" TO "LegalPersonConsentsHistory_legalPersonAccountId_fkey";
ALTER INDEX "LegalPersonConsentsHistory_legalPersonId_idx" RENAME TO "LegalPersonConsentsHistory_legalPersonAccountId_idx";

ALTER TABLE "LegalPersonGdprData" RENAME COLUMN "legalPersonId" TO "legalPersonAccountId";
ALTER TABLE "LegalPersonGdprData" RENAME CONSTRAINT "LegalPersonGdprData_legalPersonId_fkey" TO "LegalPersonGdprData_legalPersonAccountId_fkey";

ALTER TABLE "LegalPersonLoginClient" RENAME COLUMN "legalPersonId" TO "legalPersonAccountId";
ALTER TABLE "LegalPersonLoginClient" RENAME CONSTRAINT "LegalPersonLoginClient_legalPersonId_fkey" TO "LegalPersonLoginClient_legalPersonAccountId_fkey";
ALTER INDEX "LegalPersonLoginClient_legalPersonId_idx" RENAME TO "LegalPersonLoginClient_legalPersonAccountId_idx";
ALTER INDEX "LegalPersonLoginClient_legalPersonId_loginClient_key" RENAME TO "LegalPersonLoginClient_legalPersonAccountId_loginClient_key";

-- The consents history trigger function references the renamed column by name.
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
                "id", "createdAt", "legalPersonAccountId", "consentType", "isGranted"
            )
        VALUES
            (
                gen_random_uuid(), new."createdAt", new."legalPersonAccountId", new."consentType", new."isGranted"
            );
    END IF;
    RETURN new;
END;
$$;

-- =============================================================================================
-- 3. PhysicalEntity: representative identity
-- =============================================================================================
ALTER TABLE "PhysicalEntity"
    ADD COLUMN "upvsIdentityId" UUID,
    ADD COLUMN "upvsName"       TEXT;
CREATE UNIQUE INDEX "PhysicalEntity_upvsIdentityId_key" ON "PhysicalEntity" ("upvsIdentityId");

-- =============================================================================================
-- 4. New tables
-- =============================================================================================
CREATE TABLE "LegalPerson"
(
    "id"             UUID                  NOT NULL,
    "createdAt"      TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)          NOT NULL,
    "kind"           "LegalPersonKindEnum" NOT NULL,
    "ico"            TEXT                  NOT NULL,
    "upvsIdentityId" UUID,

    CONSTRAINT "LegalPerson_pkey" PRIMARY KEY ("id"),
    -- Departments are never registered in UPVS.
    CONSTRAINT "LegalPerson_department_no_upvs_identity_check"
        CHECK ("kind" <> 'DEPARTMENT' OR "upvsIdentityId" IS NULL),
    -- A department code can never collide with a real IČO (forms-backend grants form access by
    -- IČO equality), and a real company always has a numeric IČO (optionally with the `_suffix`
    -- of an UPVS organisational unit).
    CONSTRAINT "LegalPerson_ico_matches_kind_check"
        CHECK (("kind" = 'DEPARTMENT') = ("ico" !~ '^[0-9]+(_[0-9]+)?$'))
);
CREATE UNIQUE INDEX "LegalPerson_ico_key" ON "LegalPerson" ("ico");
CREATE UNIQUE INDEX "LegalPerson_upvsIdentityId_key" ON "LegalPerson" ("upvsIdentityId");

CREATE TABLE "LegalPersonRepresentation"
(
    "id"               UUID                                NOT NULL,
    "createdAt"        TIMESTAMP(3)                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)                        NOT NULL,
    "physicalEntityId" UUID                                NOT NULL,
    "legalPersonId"    UUID                                NOT NULL,
    "type"             "LegalPersonRepresentationTypeEnum" NOT NULL,
    "validFrom"        TIMESTAMP(3)                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo"          TIMESTAMP(3),
    "lastVerifiedAt"   TIMESTAMP(3)                        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalPersonRepresentation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LegalPersonRepresentation_validity_check"
        CHECK ("validTo" IS NULL OR "validTo" >= "validFrom")
);
CREATE INDEX "LegalPersonRepresentation_legalPersonId_idx" ON "LegalPersonRepresentation" ("legalPersonId");
CREATE UNIQUE INDEX "LegalPersonRepresentation_physicalEntityId_legalPersonId_key"
    ON "LegalPersonRepresentation" ("physicalEntityId", "legalPersonId");

ALTER TABLE "LegalPersonRepresentation"
    ADD CONSTRAINT "LegalPersonRepresentation_physicalEntityId_fkey" FOREIGN KEY ("physicalEntityId")
        REFERENCES "PhysicalEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "LegalPersonRepresentation_legalPersonId_fkey" FOREIGN KEY ("legalPersonId")
        REFERENCES "LegalPerson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================================
-- 5. Backfill
-- =============================================================================================

-- 5a. One company per distinct IČO.
INSERT INTO "LegalPerson" ("id", "updatedAt", "kind", "ico")
SELECT gen_random_uuid(),
       CURRENT_TIMESTAMP,
       CASE
           WHEN a."ico" ~ '^[0-9]+(_[0-9]+)?$' THEN 'PO'::"LegalPersonKindEnum"
           ELSE 'DEPARTMENT'::"LegalPersonKindEnum"
           END,
       a."ico"
FROM (SELECT DISTINCT "ico" FROM "LegalPersonAccount" WHERE "ico" IS NOT NULL) a;

UPDATE "LegalPersonAccount" a
SET "legalPersonId" = lp."id"
FROM "LegalPerson" lp
WHERE lp."ico" = a."ico";

-- 5b. Representatives of non-department companies. Reuse an existing PhysicalEntity with the
-- same birth number (ignoring the optional slash), preferring the one linked to a User, then the
-- oldest. Otherwise create a new one without a User.
CREATE TEMP TABLE "_rep_birth_number" AS
SELECT replace(a."birthNumber", '/', '') AS "normalized",
       min(a."birthNumber")               AS "birthNumber",
       NULL::UUID                         AS "physicalEntityId"
FROM "LegalPersonAccount" a
         JOIN "LegalPerson" lp ON lp."id" = a."legalPersonId"
WHERE lp."kind" <> 'DEPARTMENT'
  AND a."birthNumber" IS NOT NULL
GROUP BY replace(a."birthNumber", '/', '');

UPDATE "_rep_birth_number" r
SET "physicalEntityId" = (SELECT pe."id"
                          FROM "PhysicalEntity" pe
                          WHERE replace(pe."birthNumber", '/', '') = r."normalized"
                          ORDER BY (pe."userId" IS NULL), pe."createdAt"
                          LIMIT 1);

UPDATE "_rep_birth_number"
SET "physicalEntityId" = gen_random_uuid()
WHERE "physicalEntityId" IS NULL;

INSERT INTO "PhysicalEntity" ("id", "updatedAt", "birthNumber")
SELECT r."physicalEntityId", CURRENT_TIMESTAMP, r."birthNumber"
FROM "_rep_birth_number" r
WHERE NOT EXISTS (SELECT 1 FROM "PhysicalEntity" pe WHERE pe."id" = r."physicalEntityId");

UPDATE "LegalPersonAccount" a
SET "physicalEntityId" = r."physicalEntityId"
FROM "_rep_birth_number" r,
     "LegalPerson" lp
WHERE r."normalized" = replace(a."birthNumber", '/', '')
  AND lp."id" = a."legalPersonId"
  AND lp."kind" <> 'DEPARTMENT';

DROP TABLE "_rep_birth_number";

-- 5c. Representations. Validity starts at the first verification we know of; not re-verified yet.
INSERT INTO "LegalPersonRepresentation"
    ("id", "updatedAt", "physicalEntityId", "legalPersonId", "type", "validFrom", "lastVerifiedAt")
SELECT gen_random_uuid(),
       CURRENT_TIMESTAMP,
       a."physicalEntityId",
       a."legalPersonId",
       'STATUTORY_BODY',
       min(coalesce(a."lastVerificationAttempt", a."createdAt")),
       max(coalesce(a."lastVerificationAttempt", a."createdAt"))
FROM "LegalPersonAccount" a
WHERE a."physicalEntityId" IS NOT NULL
GROUP BY a."physicalEntityId", a."legalPersonId";

-- =============================================================================================
-- 6. LegalPersonAccount: drop the legacy columns, add constraints (after backfill)
-- =============================================================================================
-- Nothing may be lost: every IČO is on a company, every representative birth number on a person.
DO
$$
    DECLARE
        lost_count INTEGER;
    BEGIN
        SELECT count(*)
        INTO lost_count
        FROM "LegalPersonAccount" a
                 LEFT JOIN "LegalPerson" lp ON lp."id" = a."legalPersonId"
                 LEFT JOIN "PhysicalEntity" pe ON pe."id" = a."physicalEntityId"
        WHERE (a."ico" IS NOT NULL AND lp."ico" IS DISTINCT FROM a."ico")
           OR (a."birthNumber" IS NOT NULL
            AND lp."kind" <> 'DEPARTMENT'
            AND replace(pe."birthNumber", '/', '') IS DISTINCT FROM replace(a."birthNumber", '/', ''));
        IF lost_count > 0 THEN
            RAISE EXCEPTION '#1801: % LegalPersonAccount rows would lose ico/birthNumber', lost_count;
        END IF;
    END
$$;

ALTER TABLE "LegalPersonAccount"
    DROP COLUMN "ico",
    DROP COLUMN "birthNumber";

CREATE UNIQUE INDEX "LegalPersonAccount_legalPersonId_physicalEntityId_key"
    ON "LegalPersonAccount" ("legalPersonId", "physicalEntityId");
CREATE INDEX "LegalPersonAccount_physicalEntityId_idx" ON "LegalPersonAccount" ("physicalEntityId");

ALTER TABLE "LegalPersonAccount"
    -- A representative only makes sense with a company ...
    ADD CONSTRAINT "LegalPersonAccount_physical_entity_needs_legal_person_check"
        CHECK ("physicalEntityId" IS NULL OR "legalPersonId" IS NOT NULL),
    ADD CONSTRAINT "LegalPersonAccount_legalPersonId_fkey" FOREIGN KEY ("legalPersonId")
        REFERENCES "LegalPerson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "LegalPersonAccount_physicalEntityId_fkey" FOREIGN KEY ("physicalEntityId")
        REFERENCES "PhysicalEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- ... and the verifying person actually represents that company. Departments have no
    -- representations (see trigger below), so their accounts can never have a representative.
    ADD CONSTRAINT "LegalPersonAccount_physicalEntityId_legalPersonId_fkey" FOREIGN KEY ("physicalEntityId", "legalPersonId")
        REFERENCES "LegalPersonRepresentation" ("physicalEntityId", "legalPersonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================================
-- 7. Representation type must match company kind; departments have no representations.
--    Deferred to commit, so `kind` and the representation types can be changed together in one
--    transaction (PO -> FO_P correction from the Cognito account type).
-- =============================================================================================
CREATE OR REPLACE FUNCTION legal_person_representation_kind_check()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    checked_legal_person_id UUID;
    mismatch_count          INTEGER;
BEGIN
    IF tg_table_name = 'LegalPerson' THEN
        checked_legal_person_id := new."id";
    ELSE
        checked_legal_person_id := new."legalPersonId";
    END IF;

    SELECT count(*)
    INTO mismatch_count
    FROM "LegalPersonRepresentation" r
             JOIN "LegalPerson" lp ON lp."id" = r."legalPersonId"
    WHERE r."legalPersonId" = checked_legal_person_id
      AND NOT (
        (lp."kind" = 'PO' AND r."type" = 'STATUTORY_BODY')
            OR (lp."kind" = 'FO_P' AND r."type" = 'OWNER')
        );

    IF mismatch_count > 0 THEN
        RAISE EXCEPTION 'LegalPerson % has % representation(s) not allowed for its kind (DEPARTMENT has none, PO needs STATUTORY_BODY, FO_P needs OWNER)',
            checked_legal_person_id, mismatch_count
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_legal_person_representation_kind_check
    AFTER INSERT OR UPDATE OF "legalPersonId", "type"
    ON "LegalPersonRepresentation"
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION legal_person_representation_kind_check();

CREATE CONSTRAINT TRIGGER trg_legal_person_kind_check
    AFTER UPDATE OF "kind"
    ON "LegalPerson"
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION legal_person_representation_kind_check();
