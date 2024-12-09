-- CreateEnum
CREATE TYPE "CognitoUserAttributesTierEnum" AS ENUM ('NEW', 'QUEUE_IDENTITY_CARD', 'NOT_VERIFIED_IDENTITY_CARD', 'IDENTITY_CARD', 'EID');

-- AlterTable
ALTER TABLE "LegalPerson" ADD COLUMN     "cognitoTier" "CognitoUserAttributesTierEnum";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cognitoTier" "CognitoUserAttributesTierEnum";
