-- AlterTable
ALTER TABLE "LegalPerson" ALTER COLUMN "externalId" TYPE UUID USING "externalId"::UUID;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "externalId" TYPE UUID USING "externalId"::UUID;
