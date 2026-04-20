/*
  Warnings:

  - You are about to drop the column `active` on the `TaxPayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TaxPayer" DROP COLUMN "active";

INSERT INTO "Config" ( "updatedAt", key, value) VALUES ( now(), 'LOADING_NEW_USERS_FROM_CITY_ACCOUNT', '1970-01-01T00:00:00.000Z'::char)
