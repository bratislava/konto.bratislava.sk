-- Delete all records from the table, as we need to add new columns.
DELETE FROM "ExternalEdeskCheck";

-- AlterTable
ALTER TABLE "ExternalEdeskCheck" ADD COLUMN     "norisId" TEXT NOT NULL;
