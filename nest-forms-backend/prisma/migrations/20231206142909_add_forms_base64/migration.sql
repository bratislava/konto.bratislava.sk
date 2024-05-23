-- AlterEnum
ALTER TYPE "FormState" ADD VALUE 'ERROR_USER_CAN_REPAIR';

-- AlterTable
ALTER TABLE "Forms" ADD COLUMN     "formDataBase64" TEXT;
