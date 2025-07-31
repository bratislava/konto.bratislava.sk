-- CreateEnum
CREATE TYPE "DeliveryMethodEnum" AS ENUM ('EDESK', 'CITY_ACCOUNT', 'POSTAL');

-- CreateEnum
CREATE TYPE "DeliveryMethodUserEnum" AS ENUM ('CITY_ACCOUNT', 'POSTAL');

-- CreateEnum
CREATE TYPE "GDPRTypeEnum" AS ENUM ('ANALYTICS', 'DATAPROCESSING', 'FORMAL_COMMUNICATION', 'LICENSE', 'MARKETING');

-- CreateEnum
CREATE TYPE "GDPRSubTypeEnum" AS ENUM ('subscribe', 'unsubscribe');

-- CreateEnum
CREATE TYPE "GDPRCategoryEnum" AS ENUM ('CITY', 'ESBS', 'SWIMMINGPOOLS', 'TAXES', 'INIT', 'LIBRARY');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "taxDeliveryMethod"                "DeliveryMethodUserEnum",
    ADD COLUMN "taxDeliveryMethodCityAccountDate" TIMESTAMP(3),
    ADD COLUMN "taxDeliveryMethodAtLockDate"      "DeliveryMethodEnum",
    ADD COLUMN "taxDeliveryMethodCityAccountLockDate" TIMESTAMP(3);

-- Update
DO
$$
    DECLARE
        cutoff_date                       CONSTANT DATE                            := '2025-04-01';
        tax_category                      CONSTANT TEXT                            := 'TAXES';
        communication_type_city_account   CONSTANT TEXT                            := 'FORMAL_COMMUNICATION';
        communication_type_postal         CONSTANT TEXT                            := 'POSTAL';
        required_tier                     CONSTANT "CognitoUserAttributesTierEnum" := 'IDENTITY_CARD';
        eid_tier                          CONSTANT "CognitoUserAttributesTierEnum" := 'EID';
        subscription_subtype_city_account CONSTANT TEXT                            := 'subscribe';
        subscription_subtype_postal       CONSTANT TEXT                            := 'unsubscribe';
        edesk_priority                    CONSTANT INT                             := 1;
        city_account_priority             CONSTANT INT                             := 2;
        postal_priority                   CONSTANT INT                             := 3;
        updated_count                              INT;
    BEGIN
        -- Create temporary table for all delivery methods
        CREATE TEMPORARY TABLE temp_delivery_data_at_lock_date
        (
            id_user           uuid,
            delivery_method   "DeliveryMethodEnum",
            priority          INTEGER,
            city_account_date TIMESTAMP(3)
        );
        CREATE TEMPORARY TABLE temp_delivery_data_active
        (
            id_user           uuid,
            delivery_method   "DeliveryMethodUserEnum",
            priority          INTEGER,
            city_account_date TIMESTAMP(3)
        );

        -- Insert city account users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, priority, city_account_date)
        SELECT DISTINCT ON (ugd."userId") ugd."userId",
                                          'CITY_ACCOUNT'::"DeliveryMethodEnum",
                                          city_account_priority,
                                          ugd."createdAt"
        FROM "UserGdprData" ugd
                 JOIN "User" u ON ugd."userId" = u.id
        WHERE ugd."createdAt" < cutoff_date
          AND ugd.category = tax_category
          AND ugd.type = communication_type_city_account
          AND u."cognitoTier" = required_tier
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_city_account
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        INSERT INTO temp_delivery_data_active (id_user, delivery_method, priority, city_account_date)
        SELECT DISTINCT ON (ugd."userId") ugd."userId",
                                          'CITY_ACCOUNT'::"DeliveryMethodUserEnum",
                                          city_account_priority,
                                          ugd."createdAt"
        FROM "UserGdprData" ugd
                 JOIN "User" u ON ugd."userId" = u.id
        WHERE ugd.category = tax_category
          AND ugd.type = communication_type_city_account
          AND u."cognitoTier" = required_tier
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_city_account
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        -- Insert e-desk users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, priority, city_account_date)
        SELECT pe."userId",
               'EDESK'::"DeliveryMethodEnum",
               edesk_priority,
               NULL
        FROM "PhysicalEntity" pe
                 JOIN "User" u ON u.id = pe."userId"
        WHERE pe."activeEdesk" = 'true'
          AND (u."cognitoTier" = required_tier OR u."cognitoTier" = eid_tier)
          AND u."birthNumber" IS NOT NULL;

        -- Insert postal users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, priority, city_account_date)
        SELECT DISTINCT ON (ugd."userId") u.id,
                                          'POSTAL'::"DeliveryMethodEnum",
                                          postal_priority,
                                          NULL
        FROM "User" u
                 JOIN "UserGdprData" ugd ON ugd."userId" = u.id
        WHERE ugd."createdAt" < cutoff_date
          AND ugd."category" = tax_category
          AND ugd."type" = communication_type_postal
          AND u."cognitoTier" = required_tier
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_postal
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        INSERT INTO temp_delivery_data_active (id_user, delivery_method, priority, city_account_date)
        SELECT DISTINCT ON (ugd."userId") u.id,
                                          'POSTAL'::"DeliveryMethodUserEnum",
                                          postal_priority,
                                          NULL
        FROM "User" u
                 JOIN "UserGdprData" ugd ON ugd."userId" = u.id
        WHERE ugd."category" = tax_category
          AND ugd."type" = communication_type_postal
          AND u."cognitoTier" = required_tier
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_postal
        ORDER BY ugd."userId", ugd."createdAt" DESC;


        -- Perform the update with prioritized data
        UPDATE "User" u
        SET "taxDeliveryMethodAtLockDate"      = delivery_data.delivery_method,
            "taxDeliveryMethodCityAccountLockDate" = delivery_data.city_account_date
        FROM (SELECT DISTINCT ON (id_user) id_user,
                                           delivery_method,
                                           city_account_date
              FROM temp_delivery_data_at_lock_date
              ORDER BY id_user, priority) delivery_data
        WHERE u.id = delivery_data.id_user;

        UPDATE "User" u
        SET "taxDeliveryMethod"      = delivery_data.delivery_method,
            "taxDeliveryMethodCityAccountDate" = delivery_data.city_account_date
        FROM (SELECT DISTINCT ON (id_user) id_user,
                                           delivery_method,
                                           city_account_date
              FROM temp_delivery_data_active
              ORDER BY id_user, priority) delivery_data
        WHERE u.id = delivery_data.id_user;

        -- Cleanup
        DROP TABLE temp_delivery_data_at_lock_date;
        DROP TABLE temp_delivery_data_active;
    END
$$;

ALTER TABLE "User"
    ADD CONSTRAINT check_tax_delivery_method_date
        CHECK ( "User"."taxDeliveryMethod" != 'CITY_ACCOUNT' OR
                "User"."taxDeliveryMethodCityAccountDate" IS NOT NULL ),

    ADD CONSTRAINT check_tax_delivery_method_date_lock
        CHECK ( "User"."taxDeliveryMethodAtLockDate" != 'CITY_ACCOUNT' OR
                "User"."taxDeliveryMethodCityAccountLockDate" IS NOT NULL );



-- Create temporary columns with enum types
ALTER TABLE "UserGdprData"
    ADD COLUMN "type_new" "GDPRTypeEnum";
ALTER TABLE "UserGdprData"
    ADD COLUMN "category_new" "GDPRCategoryEnum";
ALTER TABLE "UserGdprData"
    ADD COLUMN "subType_new" "GDPRSubTypeEnum";

ALTER TABLE "LegalPersonGdprData"
    ADD COLUMN "type_new" "GDPRTypeEnum";
ALTER TABLE "LegalPersonGdprData"
    ADD COLUMN "category_new" "GDPRCategoryEnum";
ALTER TABLE "LegalPersonGdprData"
    ADD COLUMN "subType_new" "GDPRSubTypeEnum";

-- Update the new columns with mapped values
UPDATE "UserGdprData"
SET "type_new"     = CASE
                         WHEN UPPER("type") = 'ANALYTICS' THEN 'ANALYTICS'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'DATAPROCESSING' THEN 'DATAPROCESSING'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'FORMAL_COMMUNICATION' THEN 'FORMAL_COMMUNICATION'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'LICENSE' THEN 'LICENSE'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'MARKETING' THEN 'MARKETING'::"GDPRTypeEnum"
    END,
    "category_new" = CASE
                         WHEN UPPER("category") = 'CITY' THEN 'CITY'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'ESBS' THEN 'ESBS'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'SWIMMINGPOOLS' THEN 'SWIMMINGPOOLS'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'TAXES' THEN 'TAXES'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'INIT' THEN 'INIT'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'LIBRARY' THEN 'LIBRARY'::"GDPRCategoryEnum"
        END,
    "subType_new"  = CASE
                         WHEN "subType" = 'subscribe' THEN 'subscribe'::"GDPRSubTypeEnum"
                         WHEN "subType" = 'unsubscribe' THEN 'unsubscribe'::"GDPRSubTypeEnum"
        END;
UPDATE "LegalPersonGdprData"
SET "type_new"     = CASE
                         WHEN UPPER("type") = 'ANALYTICS' THEN 'ANALYTICS'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'DATAPROCESSING' THEN 'DATAPROCESSING'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'FORMAL_COMMUNICATION' THEN 'FORMAL_COMMUNICATION'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'LICENSE' THEN 'LICENSE'::"GDPRTypeEnum"
                         WHEN UPPER("type") = 'MARKETING' THEN 'MARKETING'::"GDPRTypeEnum"
    END,
    "category_new" = CASE
                         WHEN UPPER("category") = 'CITY' THEN 'CITY'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'ESBS' THEN 'ESBS'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'SWIMMINGPOOLS' THEN 'SWIMMINGPOOLS'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'TAXES' THEN 'TAXES'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'INIT' THEN 'INIT'::"GDPRCategoryEnum"
                         WHEN UPPER("category") = 'LIBRARY' THEN 'LIBRARY'::"GDPRCategoryEnum"
        END,
    "subType_new"  = CASE
                         WHEN "subType" = 'subscribe' THEN 'subscribe'::"GDPRSubTypeEnum"
                         WHEN "subType" = 'unsubscribe' THEN 'unsubscribe'::"GDPRSubTypeEnum"
        END;



-- Drop old columns and rename new ones
ALTER TABLE "UserGdprData"
    DROP COLUMN "type",
    DROP COLUMN "category",
    DROP COLUMN "subType";
ALTER TABLE "UserGdprData"
    RENAME COLUMN "type_new" TO "type";
ALTER TABLE "UserGdprData"
    RENAME COLUMN "category_new" TO "category";
ALTER TABLE "UserGdprData"
    RENAME COLUMN "subType_new" TO "subType";

-- Delete rows where type_new or category_new are NULL before setting NOT NULL constraint
DELETE FROM "UserGdprData"
WHERE "type" IS NULL OR "category" IS NULL;

-- Add NOT NULL constraints
ALTER TABLE "UserGdprData"
    ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "UserGdprData"
    ALTER COLUMN "category" SET NOT NULL;


-- Drop old columns and rename new ones
ALTER TABLE "LegalPersonGdprData"
    DROP COLUMN "type",
    DROP COLUMN "category",
    DROP COLUMN "subType";
ALTER TABLE "LegalPersonGdprData"
    RENAME COLUMN "type_new" TO "type";
ALTER TABLE "LegalPersonGdprData"
    RENAME COLUMN "category_new" TO "category";
ALTER TABLE "LegalPersonGdprData"
    RENAME COLUMN "subType_new" TO "subType";

-- Delete rows where type_new or category_new are NULL before setting NOT NULL constraint
DELETE FROM "LegalPersonGdprData"
WHERE "type" IS NULL OR "category" IS NULL;

-- Add NOT NULL constraints
ALTER TABLE "LegalPersonGdprData"
    ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "LegalPersonGdprData"
    ALTER COLUMN "category" SET NOT NULL;
