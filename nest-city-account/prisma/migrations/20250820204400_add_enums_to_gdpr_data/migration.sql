-- CreateEnum
CREATE TYPE "GDPRTypeEnum" AS ENUM ('ANALYTICS', 'DATAPROCESSING', 'FORMAL_COMMUNICATION', 'LICENSE', 'MARKETING');

-- CreateEnum
CREATE TYPE "GDPRSubTypeEnum" AS ENUM ('subscribe', 'unsubscribe');

-- CreateEnum
CREATE TYPE "GDPRCategoryEnum" AS ENUM ('CITY', 'ESBS', 'SWIMMINGPOOLS', 'TAXES', 'INIT', 'LIBRARY');


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
DELETE
FROM "UserGdprData"
WHERE "type" IS NULL
   OR "category" IS NULL;

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
DELETE
FROM "LegalPersonGdprData"
WHERE "type" IS NULL
   OR "category" IS NULL;

-- Add NOT NULL constraints
ALTER TABLE "LegalPersonGdprData"
    ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "LegalPersonGdprData"
    ALTER COLUMN "category" SET NOT NULL;
