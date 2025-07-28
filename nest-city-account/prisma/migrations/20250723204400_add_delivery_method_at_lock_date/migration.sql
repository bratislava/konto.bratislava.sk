-- CreateEnum
CREATE TYPE "DeliveryMethodEnum" AS ENUM ('EDESK', 'CITY_ACCOUNT', 'POSTAL');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "taxDeliveryMethodAtLockDate"      "DeliveryMethodEnum",
    ADD COLUMN "taxDeliveryMethodCityAccountDate" TIMESTAMP(3);

-- Update
DO
$$
    DECLARE
        cutoff_date           CONSTANT DATE := '2025-04-01';
        tax_category          CONSTANT TEXT := 'TAXES';
        communication_type    CONSTANT TEXT := 'FORMAL_COMMUNICATION';
        required_tier         CONSTANT "CognitoUserAttributesTierEnum" := 'IDENTITY_CARD';
        eid_tier              CONSTANT "CognitoUserAttributesTierEnum" := 'EID';
        subscription_subtype  CONSTANT TEXT := 'subscribe';

        edesk_priority        CONSTANT INT  := 1;
        city_account_priority CONSTANT INT  := 2;
        postal_priority       CONSTANT INT  := 3;

        updated_count                  INT;
    BEGIN
        -- Create temporary table for all delivery methods
        CREATE TEMPORARY TABLE temp_delivery_data (
                                                      id_user uuid,
                                                      delivery_method "DeliveryMethodEnum",
                                                      priority INTEGER,
                                                      city_account_date TIMESTAMP(3)
        );

        -- Insert city account users
        INSERT INTO temp_delivery_data (id_user, delivery_method, priority, city_account_date)
        SELECT DISTINCT ON (ugd."userId")
            ugd."userId",
            'CITY_ACCOUNT'::"DeliveryMethodEnum",
            city_account_priority,
            ugd."createdAt"
        FROM "UserGdprData" ugd
                 JOIN "User" u2 ON ugd."userId" = u2.id
        WHERE ugd."createdAt" < cutoff_date
          AND ugd.category = tax_category
          AND ugd.type = communication_type
          AND u2."cognitoTier" = required_tier
          AND u2."birthNumber" IS NOT NULL
          AND ugd."subType" = subscription_subtype
        ORDER BY ugd."userId", ugd."createdAt" DESC;

        -- Insert e-desk users
        INSERT INTO temp_delivery_data (id_user, delivery_method, priority, city_account_date)
        SELECT pe."userId",
               'EDESK'::"DeliveryMethodEnum",
               edesk_priority,
               NULL
        FROM "PhysicalEntity" pe
                 JOIN "User" u3 ON u3.id = pe."userId"
        WHERE pe."activeEdesk" = 'true'
          AND (u3."cognitoTier" = required_tier OR u3."cognitoTier" = eid_tier)
          AND u3."birthNumber" IS NOT NULL;

        -- Insert postal users (fallback)
        INSERT INTO temp_delivery_data (id_user, delivery_method, priority, city_account_date)
        SELECT id,
               'POSTAL'::"DeliveryMethodEnum",
               postal_priority,
               NULL
        FROM "User"
        WHERE "cognitoTier" = required_tier
          AND "birthNumber" IS NOT NULL;

        -- Perform the update with prioritized data
        UPDATE "User" u
        SET "taxDeliveryMethodAtLockDate" = delivery_data.delivery_method,
            "taxDeliveryMethodCityAccountDate" = delivery_data.city_account_date
        FROM (
                 SELECT DISTINCT ON (id_user)
                     id_user,
                     delivery_method,
                     city_account_date
                 FROM temp_delivery_data
                 ORDER BY id_user, priority
             ) delivery_data
        WHERE u.id = delivery_data.id_user;

        -- Get update count and log results
        GET DIAGNOSTICS updated_count = ROW_COUNT;

        RAISE NOTICE 'Migration completed successfully:';
        RAISE NOTICE '  - Updated % users with delivery methods', updated_count;
        RAISE NOTICE '  - City Account users: %',
            (SELECT COUNT(*) FROM "User" WHERE "taxDeliveryMethodAtLockDate" = 'CITY_ACCOUNT');
        RAISE NOTICE '  - E-Desk users: %',
            (SELECT COUNT(*) FROM "User" WHERE "taxDeliveryMethodAtLockDate" = 'EDESK');
        RAISE NOTICE '  - Postal users: %',
            (SELECT COUNT(*) FROM "User" WHERE "taxDeliveryMethodAtLockDate" = 'POSTAL');

        -- Cleanup
        DROP TABLE temp_delivery_data;
    END
$$;

ALTER TABLE "User"
    ADD CONSTRAINT check_tax_delivery_method_date
        CHECK ( "User"."taxDeliveryMethodAtLockDate" != 'CITY_ACCOUNT' OR
                "User"."taxDeliveryMethodCityAccountDate" IS NOT NULL );