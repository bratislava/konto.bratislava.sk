-- CreateEnum
CREATE TYPE "DeliveryMethodEnum" AS ENUM ('EDESK', 'CITY_ACCOUNT', 'POSTAL');

-- CreateEnum
CREATE TYPE "DeliveryMethodUserEnum" AS ENUM ('CITY_ACCOUNT', 'POSTAL');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "taxDeliveryMethod"                    "DeliveryMethodUserEnum",
    ADD COLUMN "taxDeliveryMethodCityAccountDate"     TIMESTAMP(3),
    ADD COLUMN "taxDeliveryMethodAtLockDate"          "DeliveryMethodEnum",
    ADD COLUMN "taxDeliveryMethodCityAccountLockDate" TIMESTAMP(3);

-- Update
DO
$$
    DECLARE
        cutoff_date                       CONSTANT DATE                            := '2025-04-01';
        communication_type_city_account   CONSTANT "GDPRTypeEnum"                  := 'FORMAL_COMMUNICATION'::"GDPRTypeEnum";
        communication_type_postal         CONSTANT "GDPRTypeEnum"                  := 'FORMAL_COMMUNICATION'::"GDPRTypeEnum";
        required_tier_text                CONSTANT "CognitoUserAttributesTierEnum" := 'IDENTITY_CARD'::"CognitoUserAttributesTierEnum";
        eid_tier_text                     CONSTANT "CognitoUserAttributesTierEnum" := 'EID'::"CognitoUserAttributesTierEnum";
        subscription_subtype_city_account CONSTANT "GDPRSubTypeEnum"               := 'subscribe'::"GDPRSubTypeEnum";
        subscription_subtype_postal       CONSTANT "GDPRSubTypeEnum"               := 'unsubscribe'::"GDPRSubTypeEnum";
    BEGIN
        -- Create temporary table for all delivery methods
        CREATE TEMPORARY TABLE temp_delivery_data_at_lock_date
        (
            id_user              uuid,
            delivery_method      "DeliveryMethodEnum",
            delivery_method_date TIMESTAMP(3)
        );
        CREATE TEMPORARY TABLE temp_delivery_data_active
        (
            id_user              uuid,
            delivery_method      "DeliveryMethodUserEnum",
            delivery_method_date TIMESTAMP(3)
        );

        -- Insert city account users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, delivery_method_date)
        SELECT DISTINCT ON (ugd."userId") ugd."userId",
                                          'CITY_ACCOUNT'::"DeliveryMethodEnum",
                                          ugd."createdAt"
        FROM "UserGdprData" ugd
                 JOIN "User" u ON ugd."userId" = u.id
        WHERE ugd."createdAt" < cutoff_date
          AND ugd.category = 'TAXES'::"GDPRCategoryEnum"
          AND ugd.type = communication_type_city_account
          AND u."cognitoTier" = required_tier_text
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_city_account
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        INSERT INTO temp_delivery_data_active (id_user, delivery_method, delivery_method_date)
        SELECT DISTINCT ON (ugd."userId") ugd."userId",
                                          'CITY_ACCOUNT'::"DeliveryMethodUserEnum",
                                          ugd."createdAt"
        FROM "UserGdprData" ugd
                 JOIN "User" u ON ugd."userId" = u.id
        WHERE ugd.category = 'TAXES'::"GDPRCategoryEnum"
          AND ugd.type = communication_type_city_account
          AND u."cognitoTier" = required_tier_text
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_city_account
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        -- Insert e-desk users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, delivery_method_date)
        SELECT pe."userId",
               'EDESK'::"DeliveryMethodEnum",
               NOW()
        FROM "PhysicalEntity" pe
                 JOIN "User" u ON u.id = pe."userId"
        WHERE pe."activeEdesk" = true
          AND (u."cognitoTier" = required_tier_text OR
               u."cognitoTier" = eid_tier_text)
          AND u."birthNumber" IS NOT NULL;

        -- Insert postal users
        INSERT INTO temp_delivery_data_at_lock_date (id_user, delivery_method, delivery_method_date)
        SELECT DISTINCT ON (ugd."userId") u.id,
                                          'POSTAL'::"DeliveryMethodEnum",
                                          ugd."createdAt"
        FROM "User" u
                 JOIN "UserGdprData" ugd ON ugd."userId" = u.id
        WHERE ugd."createdAt" < cutoff_date
          AND ugd.category = 'TAXES'::"GDPRCategoryEnum"
          AND ugd.type = communication_type_postal
          AND u."cognitoTier" = required_tier_text
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_postal
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        INSERT INTO temp_delivery_data_active (id_user, delivery_method, delivery_method_date)
        SELECT DISTINCT ON (ugd."userId") u.id,
                                          'POSTAL'::"DeliveryMethodUserEnum",
                                          ugd."createdAt"
        FROM "User" u
                 JOIN "UserGdprData" ugd ON ugd."userId" = u.id
        WHERE ugd.category = 'TAXES'::"GDPRCategoryEnum"
          AND ugd.type = communication_type_postal
          AND u."cognitoTier" = required_tier_text
          AND u."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype_postal
        ORDER BY ugd."userId", ugd."createdAt" DESC;


        -- Perform the update with prioritized data
        UPDATE "User" u
        SET "taxDeliveryMethodAtLockDate"          = delivery_data.delivery_method,
            "taxDeliveryMethodCityAccountLockDate" = CASE
                                                         WHEN delivery_data.delivery_method = 'CITY_ACCOUNT'
                                                             THEN delivery_data.delivery_method_date
                END
        FROM (SELECT DISTINCT ON (id_user) id_user,
                                           delivery_method,
                                           delivery_method_date
              FROM temp_delivery_data_at_lock_date
              ORDER BY id_user, delivery_method_date DESC) delivery_data
        WHERE u.id = delivery_data.id_user;

        UPDATE "User" u
        SET "taxDeliveryMethod"                = delivery_data.delivery_method,
            "taxDeliveryMethodCityAccountDate" = CASE
                                                     WHEN delivery_data.delivery_method = 'CITY_ACCOUNT'
                                                         THEN delivery_data.delivery_method_date
                END
        FROM (SELECT DISTINCT ON (id_user) id_user,
                                           delivery_method,
                                           delivery_method_date
              FROM temp_delivery_data_active
              ORDER BY id_user, delivery_method_date DESC) delivery_data
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
