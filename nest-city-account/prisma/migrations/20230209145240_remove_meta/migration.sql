/*
  Warnings:

  - You are about to drop the column `meta` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `UserGdprData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "meta";

-- AlterTable
ALTER TABLE "UserGdprData" DROP COLUMN "meta";
