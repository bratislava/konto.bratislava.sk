-- AlterTable
ALTER TABLE "Forms"
ADD COLUMN "jsonVersion" TEXT NOT NULL DEFAULT '1.0';

-- Remove the default constraint after the column is added
ALTER TABLE "Forms" ALTER COLUMN "jsonVersion" DROP DEFAULT;
