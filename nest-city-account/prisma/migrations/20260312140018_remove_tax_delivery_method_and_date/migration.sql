/*
  Warnings:

  - You are about to drop the column `taxDeliveryMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodCityAccountDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "taxDeliveryMethod",
DROP COLUMN "taxDeliveryMethodCityAccountDate";
