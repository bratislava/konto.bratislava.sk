/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PhysicalEntity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PhysicalEntity_userId_key" ON "PhysicalEntity"("userId");
