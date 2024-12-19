/*
  Warnings:

  - You are about to drop the `RfoByBirthnumber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RfoByBirthnumber" DROP CONSTRAINT "RfoByBirthnumber_physicalEntityId_fkey";

-- DropTable
DROP TABLE "RfoByBirthnumber";
