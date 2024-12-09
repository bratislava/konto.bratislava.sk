/*
  Warnings:

  - You are about to drop the column `physicalEntityId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "physicalEntityId";

-- AddForeignKey
ALTER TABLE "PhysicalEntity" ADD CONSTRAINT "PhysicalEntity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
