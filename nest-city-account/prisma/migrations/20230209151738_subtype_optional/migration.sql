/*
  Warnings:

  - Made the column `type` on table `UserGdprData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserGdprData" ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "subType" DROP NOT NULL;
