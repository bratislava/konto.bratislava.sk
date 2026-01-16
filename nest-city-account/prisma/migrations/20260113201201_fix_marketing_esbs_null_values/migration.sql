-- User Gdpr Data fix
-- 1.find users with only null values in marketing esbs consent
-- 2.for users from step above change oldest null value to subscribe
BEGIN;

WITH
	FILTERED AS (
		SELECT
			*
		FROM
			(
				SELECT
					CONSENTNULL."id",
					CONSENTNULL."type",
					CONSENTNULL."category",
					CONSENTNULL."subType",
					ROW_NUMBER() OVER (
						PARTITION BY
							CONSENTNULL."userId"
						ORDER BY
							CONSENTNULL."createdAt"
					)
				FROM
					"UserGdprData" CONSENTNULL
					LEFT JOIN "UserGdprData" CONSENTSUBUNSUB ON CONSENTSUBUNSUB."userId" = CONSENTNULL."userId"
					AND CONSENTSUBUNSUB."type" = 'MARKETING'
					AND CONSENTSUBUNSUB."category" = 'ESBS'
					AND (
						CONSENTSUBUNSUB."subType" = 'subscribe'
						OR CONSENTSUBUNSUB."subType" = 'unsubscribe'
					)
				WHERE
					CONSENTNULL."type" = 'MARKETING'
					AND CONSENTNULL."category" = 'ESBS'
					AND CONSENTNULL."subType" IS NULL
					AND CONSENTSUBUNSUB."userId" IS NULL
			) ALLCONSENTNULL
		WHERE
			"row_number" = 1
	)
UPDATE "UserGdprData" UGD
SET
	"subType" = 'subscribe'
FROM
	FILTERED
WHERE
	UGD."id" = FILTERED."id";

-- remove unnecessary null values
DELETE FROM "UserGdprData"
WHERE
	"type" = 'MARKETING'
	AND "category" = 'ESBS'
	AND "subType" IS NULL;

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
WHERE
	WHERE
	"UserGdprData"."type" = 'MARKETING'
	AND "UserGdprData"."category" = 'ESBS'
	AND "UserGdprData"."userId" IS NULL
	AND "User"."registeredAt" IS NOT NULL; -- only users with "registeredAt" is real physical entity, all others are for legacy reason of verifying LegalPerson

-- LegalPerson Gdpr Data fix
-- 1.find users with only null values in marketing esbs consent
-- 2.for users from step above, change oldest null value to subscribe
WITH
	FILTERED AS (
		SELECT
			*
		FROM
			(
				SELECT
					CONSENTNULL."id",
					CONSENTNULL."type",
					CONSENTNULL."category",
					CONSENTNULL."subType",
					ROW_NUMBER() OVER (
						PARTITION BY
							CONSENTNULL."legalPersonId"
						ORDER BY
							CONSENTNULL."createdAt"
					)
				FROM
					"LegalPersonGdprData" CONSENTNULL
					LEFT JOIN "LegalPersonGdprData" CONSENTSUBUNSUB ON CONSENTSUBUNSUB."legalPersonId" = CONSENTNULL."legalPersonId"
					AND CONSENTSUBUNSUB."type" = 'MARKETING'
					AND CONSENTSUBUNSUB."category" = 'ESBS'
					AND (
						CONSENTSUBUNSUB."subType" = 'subscribe'
						OR CONSENTSUBUNSUB."subType" = 'unsubscribe'
					)
				WHERE
					CONSENTNULL."type" = 'MARKETING'
					AND CONSENTNULL."category" = 'ESBS'
					AND CONSENTNULL."subType" IS NULL
					AND CONSENTSUBUNSUB."legalPersonId" IS NULL
			) ALLCONSENTNULL
		WHERE
			"row_number" = 1
	)
UPDATE "LegalPersonGdprData" UGD
SET
	"subType" = 'subscribe'
FROM
	FILTERED
WHERE
	UGD."id" = FILTERED."id";

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
WHERE
	"LegalPersonGdprData"."type" = 'MARKETING'
	AND "LegalPersonGdprData"."category" = 'ESBS'
	AND "LegalPersonGdprData"."legalPersonId" IS NULL
	AND "LegalPerson"."registeredAt" IS NOT NULL; -- only users with "registeredAt" is real physical entity, all others are for legacy reason of verifying LegalPerson

COMMIT;