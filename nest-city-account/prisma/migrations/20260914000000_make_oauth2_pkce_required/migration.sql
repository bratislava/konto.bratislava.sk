-- PKCE is mandatory for every OAuth2 client, so every authorization request carries a code
-- challenge. Rows without one predate that requirement and can no longer be continued or
-- exchanged, so they are dropped before the columns are made NOT NULL. OAuth2Data holds
-- short-lived authorization-request state that deleteOldOAuth2Data prunes anyway.
-- Furthermore, there is no production client that does not use PKCE.
DELETE FROM "OAuth2Data" WHERE "codeChallenge" IS NULL OR "codeChallengeMethod" IS NULL;

-- AlterTable
ALTER TABLE "OAuth2Data" ALTER COLUMN "codeChallenge" SET NOT NULL,
ALTER COLUMN "codeChallengeMethod" SET NOT NULL;
