-- Add the formDefinitionSlug column with a default value temporarily
ALTER TABLE "Forms" ADD COLUMN "formDefinitionSlug" TEXT DEFAULT '';

-- Update formDefinitionSlug by joining with schema and schemaVersion
UPDATE "Forms"
SET "formDefinitionSlug" = s."slug"
FROM "SchemaVersion" sv
JOIN "Schema" s ON sv."schemaId" = s."id"
WHERE "schemaVersionId" = sv."id";

-- Alter the formDefinitionSlug column to make it NOT NULL and remove default
ALTER TABLE "Forms" ALTER COLUMN "formDefinitionSlug" SET NOT NULL;
ALTER TABLE "Forms" ALTER COLUMN "formDefinitionSlug" DROP DEFAULT;

-- DropForeignKey
ALTER TABLE "Forms" DROP CONSTRAINT "Forms_schemaVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Schema" DROP CONSTRAINT "Schema_latestVersionId_fkey";

-- DropForeignKey
ALTER TABLE "SchemaVersion" DROP CONSTRAINT "SchemaVersion_schemaId_fkey";

-- AlterTable
ALTER TABLE "Forms" DROP COLUMN "schemaVersionId";

-- DropTable
DROP TABLE "Schema";

-- DropTable
DROP TABLE "SchemaVersion";
