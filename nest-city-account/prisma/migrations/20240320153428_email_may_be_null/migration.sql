-- AlterTable
ALTER TABLE "LegalPerson" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
