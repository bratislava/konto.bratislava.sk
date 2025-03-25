-- CreateEnum
CREATE TYPE "DeliveryMethodNamed" AS ENUM ('EDESK', 'POSTAL', 'CITY_ACCOUNT');

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "deliveryMethod" "DeliveryMethodNamed";
