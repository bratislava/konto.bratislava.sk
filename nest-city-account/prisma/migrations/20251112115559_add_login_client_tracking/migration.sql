BEGIN;

-- CreateEnum
CREATE TYPE "LoginClientEnum" AS ENUM ('DPB', 'PAAS_MPA', 'CITY_ACCOUNT');

-- CreateTable
CREATE TABLE "UserLoginClient" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "loginClient" "LoginClientEnum" NOT NULL,

    CONSTRAINT "UserLoginClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPersonLoginClient" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legalPersonId" UUID NOT NULL,
    "loginClient" "LoginClientEnum" NOT NULL,

    CONSTRAINT "LegalPersonLoginClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLoginClient_userId_idx" ON "UserLoginClient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLoginClient_userId_loginClient_key" ON "UserLoginClient"("userId", "loginClient");

-- CreateIndex
CREATE INDEX "LegalPersonLoginClient_legalPersonId_idx" ON "LegalPersonLoginClient"("legalPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPersonLoginClient_legalPersonId_loginClient_key" ON "LegalPersonLoginClient"("legalPersonId", "loginClient");

-- AddForeignKey
ALTER TABLE "UserLoginClient" ADD CONSTRAINT "UserLoginClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalPersonLoginClient" ADD CONSTRAINT "LegalPersonLoginClient_legalPersonId_fkey" FOREIGN KEY ("legalPersonId") REFERENCES "LegalPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert CITY_ACCOUNT entries for all existing users
INSERT INTO "UserLoginClient" ("id", "createdAt", "updatedAt", "userId", "loginClient")
SELECT 
    gen_random_uuid(),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "id",
    'CITY_ACCOUNT'::"LoginClientEnum"
FROM "User"
ON CONFLICT ("userId", "loginClient") DO NOTHING;

-- Insert CITY_ACCOUNT entries for all existing legal persons
INSERT INTO "LegalPersonLoginClient" ("id", "createdAt", "updatedAt", "legalPersonId", "loginClient")
SELECT 
    gen_random_uuid(),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "id",
    'CITY_ACCOUNT'::"LoginClientEnum"
FROM "LegalPerson"
ON CONFLICT ("legalPersonId", "loginClient") DO NOTHING;

COMMIT;
