-- DropForeignKey
ALTER TABLE "public"."Tax" DROP CONSTRAINT "Tax_taxPayerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaxDetail" DROP CONSTRAINT "TaxDetail_taxId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaxInstallment" DROP CONSTRAINT "TaxInstallment_taxId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaxPayment" DROP CONSTRAINT "TaxPayment_taxId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Tax" ADD CONSTRAINT "Tax_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "public"."TaxPayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaxPayment" ADD CONSTRAINT "TaxPayment_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "public"."Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaxInstallment" ADD CONSTRAINT "TaxInstallment_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "public"."Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaxDetail" ADD CONSTRAINT "TaxDetail_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "public"."Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
