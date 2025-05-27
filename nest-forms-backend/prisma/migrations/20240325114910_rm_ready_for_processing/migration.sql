-- Data Migration to Update Forms with state = READY_FOR_PROCESSING to PROCESSING
BEGIN;
UPDATE "Forms" SET "state" = 'PROCESSING' WHERE "state" = 'READY_FOR_PROCESSING';
COMMIT;

-- Schema Migration to Alter Enum
BEGIN;
CREATE TYPE "FormState_new" AS ENUM ('DRAFT', 'QUEUED', 'SENDING_TO_NASES', 'DELIVERED_NASES', 'DELIVERED_GINIS', 'PROCESSING', 'FINISHED', 'REJECTED', 'ERROR', 'ERROR_USER_CAN_REPAIR');
ALTER TABLE "Forms" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Forms" ALTER COLUMN "state" TYPE "FormState_new" USING ("state"::text::"FormState_new");
ALTER TYPE "FormState" RENAME TO "FormState_old";
ALTER TYPE "FormState_new" RENAME TO "FormState";
DROP TYPE "FormState_old";
ALTER TABLE "Forms" ALTER COLUMN "state" SET DEFAULT 'DRAFT';
COMMIT;