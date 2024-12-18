/*
  Warnings:

  - You are about to drop the `RFOByBirthnumber` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activeEdesk` to the `PhysicalEntity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhysicalEntity" ADD COLUMN     "activeEdesk" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "RFOByBirthnumber";

-- CreateTable
CREATE TABLE "RfoByBirthnumber" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthNumber" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "physicalEntityId" UUID,

    CONSTRAINT "RfoByBirthnumber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RfoByBirthnumber" ADD CONSTRAINT "RfoByBirthnumber_physicalEntityId_fkey" FOREIGN KEY ("physicalEntityId") REFERENCES "PhysicalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpvsIdentityByUri" ADD CONSTRAINT "UpvsIdentityByUri_physicalEntityId_fkey" FOREIGN KEY ("physicalEntityId") REFERENCES "PhysicalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
