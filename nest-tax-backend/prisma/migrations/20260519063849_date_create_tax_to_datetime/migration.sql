-- AlterTable: rename old string column, add new DateTime column, migrate data, drop old
ALTER TABLE "Tax" RENAME COLUMN "dateCreateTax" TO "dateCreateTax_old";
ALTER TABLE "Tax" ADD COLUMN "dateCreateTax" TIMESTAMP(3) NOT NULL;
UPDATE "Tax" SET "dateCreateTax" = TO_TIMESTAMP("dateCreateTax_old", 'DD.MM.YYYY') WHERE "dateCreateTax_old" IS NOT NULL;
ALTER TABLE "Tax" DROP COLUMN "dateCreateTax_old";
