-- CreateEnum
CREATE TYPE "DeliveryMethodEnum" AS ENUM ('EDESK', 'CITY_ACCOUNT', 'POSTAL');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "taxDeliveryMethodAtLockDate" "DeliveryMethodEnum";

-- Update
UPDATE "User" u
SET "taxDeliveryMethodAtLockDate" = delivery_data.delivery_method
FROM (SELECT DISTINCT ON (id_user) id_user, delivery_method, priority
      FROM (SELECT id_user, delivery_method, priority
            FROM (SELECT DISTINCT ON (ugd."userId") ugd."userId"                         as id_user,
                                                    'CITY_ACCOUNT'::"DeliveryMethodEnum" as delivery_method,
                                                    2                                    as priority,
                                                    ugd."subType"
                  FROM "UserGdprData" ugd
                           JOIN public."User" U2 on ugd."userId" = U2.id
                  WHERE ugd."createdAt" < '2025-04-01'
                    AND ugd.category = 'TAXES'
                    AND ugd.type = 'FORMAL_COMMUNICATION'
                    AND U2."cognitoTier" = 'IDENTITY_CARD'
                    AND U2."birthNumber" is not null
                  ORDER BY ugd."userId", ugd."createdAt" desc) city_account_users
            WHERE "subType" = 'subscribe'
            UNION ALL
            SELECT *
            FROM (SELECT pe."userId" as id_user, 'EDESK'::"DeliveryMethodEnum" as delivery_method, 1 as priority
                  FROM "PhysicalEntity" pe
                           JOIN public."User" U3 on U3.id = pe."userId"
                  WHERE "activeEdesk" = 'true'
                    AND U3."cognitoTier" = 'IDENTITY_CARD'
                    AND U3."birthNumber" is not null) edesk_users
            UNION ALL
            SELECT *
            FROM (SELECT id as id_user, 'POSTAL'::"DeliveryMethodEnum" as delivery_method, 3 as priority
                  FROM "User"
                  WHERE "cognitoTier" = 'IDENTITY_CARD'
                    and "birthNumber" is not null) other_verified_users) categories
      order by id_user, priority) delivery_data
WHERE u.id = delivery_data.id_user;

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "taxDeliveryMethodCityAccountDate" TIMESTAMP(3);

ALTER TABLE "User"
    ADD CONSTRAINT check_tax_delivery_method_date
        CHECK ( "User"."taxDeliveryMethodAtLockDate" != 'CITY_ACCOUNT' OR
                "User"."taxDeliveryMethodCityAccountDate" IS NOT NULL );