/*
  Warnings:

  - A unique constraint covering the columns `[ifo,birthNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastVerificationIdentityCard" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_ifo_birthNumber_key" ON "User"("ifo", "birthNumber");
