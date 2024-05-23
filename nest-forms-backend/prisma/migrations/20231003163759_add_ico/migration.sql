-- CreateEnum
CREATE TYPE "FormOwnerType" AS ENUM ('FO', 'PO');

-- AlterTable
ALTER TABLE "Forms" ADD COLUMN     "ico" TEXT,
ADD COLUMN     "ownerType" "FormOwnerType";
