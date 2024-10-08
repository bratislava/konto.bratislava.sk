-- AlterTable
ALTER TABLE "TaxPayment" ADD COLUMN     "specificSymbol" TEXT;

-- CreateTable
CREATE TABLE "LoadingPaymentsFromNoris" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year" INTEGER,
    "loadingDate" DATE NOT NULL,
    "loudedPayments" INTEGER NOT NULL,

    CONSTRAINT "LoadingPaymentsFromNoris_pkey" PRIMARY KEY ("id")
);
