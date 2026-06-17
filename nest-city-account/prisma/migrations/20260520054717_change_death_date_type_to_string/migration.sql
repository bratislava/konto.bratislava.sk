-- AlterTable
ALTER TABLE "ExternalEdeskCheck"
  ALTER COLUMN "edeskDeathDate" SET DATA TYPE TEXT
  USING TO_CHAR("edeskDeathDate", 'YYYY-MM-DD');