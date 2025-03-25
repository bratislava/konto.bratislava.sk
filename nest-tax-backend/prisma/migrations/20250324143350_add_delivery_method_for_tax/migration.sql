-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('E', 'P', 'O');

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "deliveryMethod" "DeliveryMethod";
