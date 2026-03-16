ALTER TABLE "User" 
    ALTER COLUMN "externalId" SET NOT NULL,
    ALTER COLUMN "externalId" TYPE uuid USING "externalId"::uuid;
ALTER TABLE "LegalPerson" 
    ALTER COLUMN "externalId" SET NOT NULL,
    ALTER COLUMN "externalId" TYPE uuid USING "externalId"::uuid;