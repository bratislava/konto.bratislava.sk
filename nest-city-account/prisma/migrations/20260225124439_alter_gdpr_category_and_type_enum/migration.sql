/*
  Warnings:

  - The values [LICENSE] on the enum `GDPRTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "GDPRCategoryEnum" ADD VALUE 'PAAS_MPA';

-- AlterEnum
BEGIN;
CREATE TYPE "GDPRTypeEnum_new" AS ENUM ('ANALYTICS', 'DATAPROCESSING', 'FORMAL_COMMUNICATION', 'GENERAL', 'MARKETING');
ALTER TABLE "UserGdprData" ALTER COLUMN "type" TYPE "GDPRTypeEnum_new" USING ("type"::text::"GDPRTypeEnum_new");
ALTER TABLE "LegalPersonGdprData" ALTER COLUMN "type" TYPE "GDPRTypeEnum_new" USING ("type"::text::"GDPRTypeEnum_new");
ALTER TYPE "GDPRTypeEnum" RENAME TO "GDPRTypeEnum_old";
ALTER TYPE "GDPRTypeEnum_new" RENAME TO "GDPRTypeEnum";
DROP TYPE "public"."GDPRTypeEnum_old";
COMMIT;
