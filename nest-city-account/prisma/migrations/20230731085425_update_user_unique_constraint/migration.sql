/*
  Warnings:

  - A unique constraint covering the columns `[ifo]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[birthNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_ifo_birthNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_ifo_key" ON "User"("ifo");

-- CreateIndex
CREATE UNIQUE INDEX "User_birthNumber_key" ON "User"("birthNumber");
