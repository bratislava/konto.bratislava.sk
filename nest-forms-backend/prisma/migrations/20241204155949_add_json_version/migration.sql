-- AlterTable
ALTER TABLE "Forms"
ADD COLUMN "jsonVersion" TEXT NOT NULL DEFAULT '1.0';

-- Remove the default constraint after the column is added
ALTER TABLE "Forms" ALTER COLUMN "jsonVersion" DROP DEFAULT;

-- Update jsonVersion to 1.1 for specific forms created after Jan 14, 2025 10:00:00 UTC
UPDATE "Forms"
SET "jsonVersion" = '1.1'
WHERE "formDefinitionSlug" IN ('olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom', 'olo-energeticke-zhodnotenie-odpadu-v-zevo', 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby')
AND "createdAt" > '2025-01-14T10:00:00Z';
