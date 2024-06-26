/*
  Warnings:

  - You are about to drop the column `birthNumber` on the `UserGdprData` table. All the data in the column will be lost.
  - You are about to drop the column `ifo` on the `UserGdprData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthNumber" TEXT,
ADD COLUMN     "ifo" TEXT;

-- AlterTable
ALTER TABLE "UserGdprData" DROP COLUMN "birthNumber",
DROP COLUMN "ifo";
