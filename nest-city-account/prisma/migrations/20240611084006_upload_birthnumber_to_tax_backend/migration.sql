-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isInTaxBackend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastTaxBackendUploadTry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
