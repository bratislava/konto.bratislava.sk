/*
  Warnings:

  - You are about to drop the column `OrderId` on the `TaxPayment` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `TaxPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaxPayment" DROP COLUMN "OrderId",
ADD COLUMN     "orderId" BIGINT NOT NULL;
