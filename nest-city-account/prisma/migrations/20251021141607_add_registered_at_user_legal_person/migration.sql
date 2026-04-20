-- AlterTable
ALTER TABLE "public"."LegalPerson" ADD COLUMN     "registeredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "registeredAt" TIMESTAMP(3);
