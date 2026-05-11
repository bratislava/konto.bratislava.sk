/*
  Warnings:

  - You are about to drop the column `taxDeliveryMethodCityAccountDate` on the `User` table. All the data in the column will be lost. Its value (the date when CITY_ACCOUNT was last activated) is now derived from the latest matching row in `DeliveryMethodHistory`.

*/

-- CreateTable
CREATE TABLE "DeliveryMethodHistory"
(
    "id"        UUID                     NOT NULL,
    "createdAt" TIMESTAMP(3)             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"    uuid                     NOT NULL,
    "method"    "DeliveryMethodUserEnum" NOT NULL,

    CONSTRAINT "DeliveryMethodHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryMethodHistory_userId_idx" ON "DeliveryMethodHistory" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethodHistory_userId_createdAt_key" ON "DeliveryMethodHistory"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DeliveryMethodHistory"
    ADD CONSTRAINT "DeliveryMethodHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill DeliveryMethodHistory from UserGdprData
-- (category=TAXES, type=FORMAL_COMMUNICATION): subscribe -> CITY_ACCOUNT, unsubscribe -> POSTAL.
-- EDESK is not migrated here: it's derived from PhysicalEntity.activeEdesk and is not part of DeliveryMethodUserEnum.
INSERT INTO
    "DeliveryMethodHistory"
    (
        "id", "createdAt", "userId", "method"
    )
SELECT gen_random_uuid(),
    "createdAt",
    "userId",
    CASE "subType"
        WHEN 'subscribe' THEN 'CITY_ACCOUNT'::"DeliveryMethodUserEnum"
        WHEN 'unsubscribe' THEN 'POSTAL'::"DeliveryMethodUserEnum"
        END
FROM
    "UserGdprData"
WHERE
    "category" = 'TAXES'
    AND "type" = 'FORMAL_COMMUNICATION'
    AND "subType" IS NOT NULL;

-- Mirror User.taxDeliveryMethod changes into DeliveryMethodHistory.
-- App writes go to User.taxDeliveryMethod; the history row is created automatically.
CREATE OR REPLACE FUNCTION user_delivery_method_to_history()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW."taxDeliveryMethod" IS NOT NULL
        AND (TG_OP = 'INSERT' OR NEW."taxDeliveryMethod" IS DISTINCT FROM OLD."taxDeliveryMethod")
        THEN
        INSERT INTO "DeliveryMethodHistory" ("id", "userId", "method")
        VALUES (gen_random_uuid()::text, NEW."id", NEW."taxDeliveryMethod");
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_delivery_method_to_history
    AFTER INSERT OR UPDATE OF "taxDeliveryMethod"
    ON "User"
    FOR EACH ROW
EXECUTE PROCEDURE user_delivery_method_to_history();

-- Make DeliveryMethodHistory rows immutable: a history row cannot be modified once written.
CREATE OR REPLACE FUNCTION delivery_method_history_reject_modification()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    RAISE EXCEPTION '"DeliveryMethodHistory" rows are immutable; UPDATE is not allowed';
END;
$$;

CREATE TRIGGER trg_delivery_method_history_no_update
    BEFORE UPDATE
    ON "DeliveryMethodHistory"
    FOR EACH ROW
EXECUTE PROCEDURE delivery_method_history_reject_modification();

-- AlterTable
ALTER TABLE "User"
    DROP COLUMN "taxDeliveryMethodCityAccountDate";