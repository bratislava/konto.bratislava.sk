-- AlterTable
ALTER TABLE "TaxPayer" ADD COLUMN "readyToImport" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "TaxPayer_readyToImport_idx" ON "TaxPayer"("readyToImport");

-- Add config values for tax import settings
INSERT INTO "Config" ("key", "value")
VALUES 
  ('TAX_IMPORT_WINDOW_START_HOUR', '7'),
  ('TAX_IMPORT_WINDOW_END_HOUR', '20'),
  ('TAX_IMPORT_DAILY_LIMIT', '7200');

