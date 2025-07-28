/*
  Warnings:

  - The values [SENDING_TO_NASES] on the enum `FormState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormState_new" AS ENUM ('DRAFT', 'QUEUED', 'DELIVERED_NASES', 'DELIVERED_GINIS', 'SENDING_TO_SHAREPOINT', 'PROCESSING', 'FINISHED', 'REJECTED', 'ERROR');
ALTER TABLE "Forms" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Forms" ALTER COLUMN "state" TYPE "FormState_new" USING ("state"::text::"FormState_new");
ALTER TYPE "FormState" RENAME TO "FormState_old";
ALTER TYPE "FormState_new" RENAME TO "FormState";
DROP TYPE "FormState_old";
ALTER TABLE "Forms" ALTER COLUMN "state" SET DEFAULT 'DRAFT';
COMMIT;
