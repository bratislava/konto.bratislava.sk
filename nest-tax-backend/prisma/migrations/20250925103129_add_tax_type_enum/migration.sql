-- CreateEnum
CREATE TYPE "public"."TaxType" AS ENUM ('DZN', 'KO');

-- Step 1: Add the column as nullable first
ALTER TABLE "public"."Tax"
ADD COLUMN "type" "public"."TaxType";

-- Step 2: Backfill existing rows with 'DZN'
UPDATE "public"."Tax"
SET "type" = 'DZN';

-- Step 3: Enforce NOT NULL
ALTER TABLE "public"."Tax"
ALTER COLUMN "type" SET NOT NULL;
