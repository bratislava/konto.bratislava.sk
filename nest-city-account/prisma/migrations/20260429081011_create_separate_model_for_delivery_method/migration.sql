/*
  Warnings:

  - You are about to drop the column `taxDeliveryMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodAtLockDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodCityAccountDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `taxDeliveryMethodCityAccountLockDate` on the `User` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "DeliveryMethodHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "method" "DeliveryMethodUserEnum" NOT NULL,

    CONSTRAINT "DeliveryMethodHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryMethodHistory_userId_idx" ON "DeliveryMethodHistory"("userId");

-- AddForeignKey
ALTER TABLE "DeliveryMethodHistory" ADD CONSTRAINT "DeliveryMethodHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill DeliveryMethodHistory from UserGdprData
-- (category=TAXES, type=FORMAL_COMMUNICATION): subscribe -> CITY_ACCOUNT, unsubscribe -> POSTAL.
-- EDESK is not migrated here: it's derived from PhysicalEntity.activeEdesk and is not part of DeliveryMethodUserEnum.
INSERT INTO "DeliveryMethodHistory" ("id", "createdAt", "userId", "method")
SELECT
    gen_random_uuid()::text,
    "createdAt",
    "userId",
    CASE "subType"
        WHEN 'subscribe'   THEN 'CITY_ACCOUNT'::"DeliveryMethodUserEnum"
        WHEN 'unsubscribe' THEN 'POSTAL'::"DeliveryMethodUserEnum"
    END
FROM "UserGdprData"
WHERE "category" = 'TAXES'
  AND "type" = 'FORMAL_COMMUNICATION'
  AND "subType" IS NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "taxDeliveryMethod",
                   DROP COLUMN "taxDeliveryMethodAtLockDate",
                   DROP COLUMN "taxDeliveryMethodCityAccountDate",
                   DROP COLUMN "taxDeliveryMethodCityAccountLockDate";