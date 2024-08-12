-- CreateEnum
CREATE TYPE "TaxDetailType" AS ENUM ('APARTMENT', 'CONSTRUCTION', 'GROUND');

-- CreateEnum
CREATE TYPE "TaxPaymentSource" AS ENUM ('CARD', 'QRCODE', 'BANK_ACCOUNT', 'POST', 'CASH');

-- CreateEnum
CREATE TYPE "TaxDetailareaType" AS ENUM ('NONRESIDENTIAL', 'RESIDENTIAL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'jH', 'jI', 'byt', 'nebyt');

-- CreateTable
CREATE TABLE "TaxPayer" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,
    "birthNumber" TEXT NOT NULL,

    CONSTRAINT "TaxPayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year" INTEGER NOT NULL,
    "taxPayerId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "variableSymbol" TEXT NOT NULL,
    "taxEmployeeId" INTEGER NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxPayment" (
    "id" SERIAL NOT NULL,
    "OrderId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'NEW',
    "amount" INTEGER NOT NULL,
    "source" "TaxPaymentSource",

    CONSTRAINT "TaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxInstallment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxId" INTEGER NOT NULL,
    "order" TEXT,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "TaxInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxDetail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxId" INTEGER NOT NULL,
    "type" "TaxDetailType" NOT NULL,
    "areaType" "TaxDetailareaType" NOT NULL,
    "area" TEXT,
    "base" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "TaxDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxEmployee" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "TaxEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayer_birthNumber_key" ON "TaxPayer"("birthNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayer_uuid_key" ON "TaxPayer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Tax_taxPayerId_year_key" ON "Tax"("taxPayerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Tax_uuid_key" ON "Tax"("uuid");

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_taxPayerId_fkey" FOREIGN KEY ("taxPayerId") REFERENCES "TaxPayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_taxEmployeeId_fkey" FOREIGN KEY ("taxEmployeeId") REFERENCES "TaxEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPayment" ADD CONSTRAINT "TaxPayment_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxInstallment" ADD CONSTRAINT "TaxInstallment_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxDetail" ADD CONSTRAINT "TaxDetail_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
