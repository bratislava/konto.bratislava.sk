ALTER TABLE "LegalPerson" RENAME COLUMN "birthnumberAlreadyExistsCounter" TO "birthnumberIcoAlreadyExistsCounter";
ALTER TABLE "LegalPerson" RENAME COLUMN "birthnumberAlreadyExistsLast" TO "birthnumberIcoAlreadyExistsLast";
ALTER TABLE "LegalPerson" RENAME COLUMN "lastVerificationIdentityCard" TO "lastVerificationAttempt";
ALTER TABLE "LegalPerson" DROP COLUMN "oldMagproxyDatabase",
DROP COLUMN "requeuedInVerification";
