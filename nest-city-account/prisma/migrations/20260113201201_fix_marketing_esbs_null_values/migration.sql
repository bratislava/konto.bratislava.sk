-- User Gdpr Data fix
-- 1.find users with only null values in marketing esbs consent
-- 2.for users from step above change oldest null value to subscribe
BEGIN;

WITH
  filtered AS (
    SELECT DISTINCT
      ON (consentnull."userId") consentnull."id"
    FROM
      "UserGdprData" consentnull
    WHERE
      consentnull."type" = 'MARKETING'
      AND consentnull."category" = 'ESBS'
      AND consentnull."subType" IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          "UserGdprData" consentsubunsub
        WHERE
          consentsubunsub."userId" = consentnull."userId"
          AND consentsubunsub."type" = 'MARKETING'
          AND consentsubunsub."category" = 'ESBS'
          AND consentsubunsub."subType" IN ('subscribe', 'unsubscribe')
      )
    ORDER BY
      consentnull."userId",
      consentnull."createdAt"
  )
UPDATE "UserGdprData" ugd
SET
  "subType" = 'subscribe'
FROM
  filtered
WHERE
  ugd."id" = filtered."id";

-- for every person, that at this point don't any marketing consent,
-- add subscribe at a date of registering of account to cognito
INSERT INTO
	"UserGdprData" (
		"id",
		"createdAt",
		"updatedAt",
		"userId",
		"type",
		"category",
		"subType"
	)
SELECT
	GEN_RANDOM_UUID(),
	"registeredAt",
	CURRENT_TIMESTAMP,
	"User"."id",
	'MARKETING',
	'ESBS',
	'subscribe'
FROM
	"User"
	LEFT JOIN "UserGdprData" ON "User"."id" = "UserGdprData"."userId"
	AND "UserGdprData"."type" = 'MARKETING'
	AND "UserGdprData"."category" = 'ESBS'
WHERE
	"UserGdprData"."userId" IS NULL
	AND "User"."registeredAt" IS NOT NULL; -- only users with "registeredAt" is real physical entity, all others are for legacy reason of verifying LegalPerson

-- LegalPerson Gdpr Data fix
-- 1.find users with only null values in marketing esbs consent
-- 2.for users from step above, change oldest null value to subscribe
WITH
  filtered AS (
    SELECT DISTINCT
      ON (consentnull."legalPersonId") consentnull."id"
    FROM
      "LegalPersonGdprData" consentnull
    WHERE
      consentnull."type" = 'MARKETING'
      AND consentnull."category" = 'ESBS'
      AND consentnull."subType" IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          "LegalPersonGdprData" consentsubunsub
        WHERE
          consentsubunsub."legalPersonId" = consentnull."legalPersonId"
          AND consentsubunsub."type" = 'MARKETING'
          AND consentsubunsub."category" = 'ESBS'
          AND consentsubunsub."subType" IN ('subscribe', 'unsubscribe')
      )
    ORDER BY
      consentnull."legalPersonId",
      consentnull."createdAt"
  )
UPDATE "LegalPersonGdprData" lpgd
SET
  "subType" = 'subscribe'
FROM
  filtered
WHERE
  lpgd."id" = filtered."id";

-- remove unnecessary null values
DELETE FROM "LegalPersonGdprData"
WHERE
	"type" = 'MARKETING'
	AND "category" = 'ESBS'
	AND "subType" IS NULL;

-- for every person, that at this point don't any marketing consent,
-- add subscribe at a date of registering of account to cognito
INSERT INTO
	"LegalPersonGdprData" (
		"id",
		"createdAt",
		"updatedAt",
		"legalPersonId",
		"type",
		"category",
		"subType"
	)
SELECT
	GEN_RANDOM_UUID(),
	"registeredAt",
	CURRENT_TIMESTAMP,
	"LegalPerson"."id",
	'MARKETING',
	'ESBS',
	'subscribe'
FROM
	"LegalPerson"
	LEFT JOIN "LegalPersonGdprData" ON "LegalPerson"."id" = "LegalPersonGdprData"."legalPersonId"
	AND "LegalPersonGdprData"."type" = 'MARKETING'
	AND "LegalPersonGdprData"."category" = 'ESBS'
WHERE
	"LegalPersonGdprData"."legalPersonId" IS NULL
	AND "LegalPerson"."registeredAt" IS NOT NULL; -- only users with "registeredAt" is real physical entity, all others are for legacy reason of verifying LegalPerson

COMMIT;