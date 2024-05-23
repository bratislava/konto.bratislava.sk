/*
  Warnings:

  - You are about to drop the column `formHtml` on the `SchemaVersion` table. All the data in the column will be lost.
  - You are about to drop the column `formHtmlSef` on the `SchemaVersion` table. All the data in the column will be lost.
  - You are about to drop the column `formSb` on the `SchemaVersion` table. All the data in the column will be lost.
  - You are about to drop the column `formSbSef` on the `SchemaVersion` table. All the data in the column will be lost.
  - You are about to drop the column `schemaXsd` on the `SchemaVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SchemaVersion" DROP COLUMN "formHtml",
DROP COLUMN "formHtmlSef",
DROP COLUMN "formSb",
DROP COLUMN "formSbSef",
DROP COLUMN "schemaXsd";
