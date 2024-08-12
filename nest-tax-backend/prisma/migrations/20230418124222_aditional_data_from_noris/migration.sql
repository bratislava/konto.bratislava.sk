-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "dateCreateTax" TEXT,
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "TaxInstallment" ADD COLUMN     "text" TEXT;

-- AlterTable
ALTER TABLE "TaxPayer" ADD COLUMN     "name" TEXT,
ADD COLUMN     "nameTxt" TEXT,
ADD COLUMN     "permanentResidenceCity" TEXT,
ADD COLUMN     "permanentResidenceStreet" TEXT,
ADD COLUMN     "permanentResidenceStreetTxt" TEXT,
ADD COLUMN     "permanentResidenceZip" TEXT;
