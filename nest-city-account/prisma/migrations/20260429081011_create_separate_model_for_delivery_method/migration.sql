/*
  Warnings:

  - You are about to drop the column `taxDeliveryMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodAtLockDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodCityAccountDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodCityAccountLockDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "taxDeliveryMethod",
DROP COLUMN "taxDeliveryMethodAtLockDate",
DROP COLUMN "taxDeliveryMethodCityAccountDate",
DROP COLUMN "taxDeliveryMethodCityAccountLockDate";

-- CreateTable
CREATE TABLE "DeliveryMethodUserHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "method" "DeliveryMethodUserEnum" NOT NULL,

    CONSTRAINT "DeliveryMethodUserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryMethodLegalPersonHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legalPersonId" UUID NOT NULL,
    "method" "DeliveryMethodUserEnum" NOT NULL,

    CONSTRAINT "DeliveryMethodLegalPersonHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryMethodUserHistory_userId_idx" ON "DeliveryMethodUserHistory"("userId");

-- CreateIndex
CREATE INDEX "DeliveryMethodLegalPersonHistory_legalPersonId_idx" ON "DeliveryMethodLegalPersonHistory"("legalPersonId");

-- AddForeignKey
ALTER TABLE "DeliveryMethodUserHistory" ADD CONSTRAINT "DeliveryMethodUserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryMethodLegalPersonHistory" ADD CONSTRAINT "DeliveryMethodLegalPersonHistory_legalPersonId_fkey" FOREIGN KEY ("legalPersonId") REFERENCES "LegalPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
