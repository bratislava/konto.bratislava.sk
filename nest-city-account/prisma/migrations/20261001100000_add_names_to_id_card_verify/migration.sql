-- Existing rows predate the name columns and their names can't be encrypted in SQL, so they get an
-- unencrypted placeholder. The defaults are dropped right after, new rows must always set both names.

-- AlterTable
ALTER TABLE "UserIdCardVerify"
    ADD COLUMN "familyName" TEXT NOT NULL DEFAULT 'not-set',
    ADD COLUMN "givenName"  TEXT NOT NULL DEFAULT 'not-set';

ALTER TABLE "UserIdCardVerify"
    ALTER COLUMN "familyName" DROP DEFAULT,
    ALTER COLUMN "givenName" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LegalPersonIcoIdCardVerify"
    ADD COLUMN "familyName" TEXT NOT NULL DEFAULT 'not-set',
    ADD COLUMN "givenName"  TEXT NOT NULL DEFAULT 'not-set';

ALTER TABLE "LegalPersonIcoIdCardVerify"
    ALTER COLUMN "familyName" DROP DEFAULT,
    ALTER COLUMN "givenName" DROP DEFAULT;
