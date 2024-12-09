/*
  Warnings:

  - You are about to drop the column `citizenId` on the `RFOByBirthnumber` table. All the data in the column will be lost.
  - You are about to drop the column `citizenId` on the `UpvsIdentityByUri` table. All the data in the column will be lost.
  - You are about to drop the column `citizenId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Citizen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RFOByBirthnumber" DROP CONSTRAINT "RFOByBirthnumber_citizenId_fkey";

-- DropForeignKey
ALTER TABLE "UpvsIdentityByUri" DROP CONSTRAINT "UpvsIdentityByUri_citizenId_fkey";

-- AlterTable
ALTER TABLE "RFOByBirthnumber" DROP COLUMN "citizenId",
ADD COLUMN     "physicalEntityId" UUID;

-- AlterTable
ALTER TABLE "UpvsIdentityByUri" DROP COLUMN "citizenId",
ADD COLUMN     "physicalEntityId" UUID;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "citizenId",
ADD COLUMN     "physicalEntityId" UUID;

-- DropTable
DROP TABLE "Citizen";

-- CreateTable
CREATE TABLE "PhysicalEntity" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,
    "uri" TEXT,
    "ifo" TEXT,
    "birthNumber" TEXT,

    CONSTRAINT "PhysicalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalEntity_uri_key" ON "PhysicalEntity"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalEntity_ifo_key" ON "PhysicalEntity"("ifo");
