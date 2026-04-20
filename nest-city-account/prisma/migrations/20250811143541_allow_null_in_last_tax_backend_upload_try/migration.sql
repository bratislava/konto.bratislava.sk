-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastTaxBackendUploadTry" DROP NOT NULL,
ALTER COLUMN "lastTaxBackendUploadTry" DROP DEFAULT;
