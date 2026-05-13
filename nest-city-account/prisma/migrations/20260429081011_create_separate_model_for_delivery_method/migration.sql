/*
  Warnings:

  - You are about to drop the column `taxDeliveryMethodCityAccountDate` on the `User` table. All the data in the column will be lost. Its value (the date when CITY_ACCOUNT was last activated) is now derived from the latest matching row in `DeliveryMethodHistory`.

*/

-- CreateTable
CREATE TABLE "DeliveryMethodPreferenceHistory"
(
    "id"        UUID                     NOT NULL,
    "createdAt" TIMESTAMP(3)             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"    uuid                     NOT NULL,
    "method"    "DeliveryMethodUserEnum" NOT NULL,

    CONSTRAINT "DeliveryMethodPreferenceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryMethodPreferenceHistory_userId_idx" ON "DeliveryMethodPreferenceHistory" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethodPreferenceHistory_userId_createdAt_key" ON "DeliveryMethodPreferenceHistory"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DeliveryMethodPreferenceHistory"
    ADD CONSTRAINT "DeliveryMethodPreferenceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill DeliveryMethodPreferenceHistory from UserGdprData
-- (category=TAXES, type=FORMAL_COMMUNICATION): subscribe -> CITY_ACCOUNT, unsubscribe -> POSTAL.
-- EDESK is not migrated here: it's derived from PhysicalEntity.activeEdesk and is not part of DeliveryMethodUserPreferenceEnum.
INSERT INTO
    "DeliveryMethodPreferenceHistory"
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

-- Mirror User.taxDeliveryMethod changes into DeliveryMethodPreferenceHistory.
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
        INSERT INTO "DeliveryMethodPreferenceHistory" ("id", "userId", "method")
        VALUES (gen_random_uuid(), NEW."id", NEW."taxDeliveryMethod");
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_delivery_method_to_history
    AFTER INSERT OR UPDATE OF "taxDeliveryMethod"
    ON "User"
    FOR EACH ROW
EXECUTE PROCEDURE user_delivery_method_to_history();

-- Make DeliveryMethodPreferenceHistory rows immutable: a history row cannot be modified once written.
CREATE OR REPLACE FUNCTION delivery_method_history_reject_modification()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    RAISE EXCEPTION '"DeliveryMethodPreferenceHistory" rows are immutable; UPDATE is not allowed';
END;
$$;

CREATE TRIGGER trg_delivery_method_history_no_update
    BEFORE UPDATE
    ON "DeliveryMethodPreferenceHistory"
    FOR EACH ROW
EXECUTE PROCEDURE delivery_method_history_reject_modification();

-- AlterTable
ALTER TABLE "User"
    DROP COLUMN "taxDeliveryMethodCityAccountDate";

-- Rename Enum

ALTER TYPE "DeliveryMethodUserEnum" RENAME TO "DeliveryMethodUserPreferenceEnum";
