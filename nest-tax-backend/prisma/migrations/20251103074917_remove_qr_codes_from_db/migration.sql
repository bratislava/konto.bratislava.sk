/*
  Warnings:

  - You are about to drop the column `qrCodeEmail` on the `Tax` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeWeb` on the `Tax` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "qrCodeEmail",
DROP COLUMN "qrCodeWeb";
