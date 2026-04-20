/*
  Warnings:

  - A unique constraint covering the columns `[name,taxType]` on the table `CsvFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taxType` to the `CsvFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."CsvFile_name_key";

-- AlterTable
ALTER TABLE "CsvFile" ADD COLUMN "taxType" "TaxType";

-- Set taxType to DZN
UPDATE "CsvFile" SET "taxType" = 'DZN'::"TaxType";

-- Set taxType to NOT NULL
ALTER TABLE "CsvFile" ALTER COLUMN "taxType" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CsvFile_name_taxType_key" ON "CsvFile"("name", "taxType");
