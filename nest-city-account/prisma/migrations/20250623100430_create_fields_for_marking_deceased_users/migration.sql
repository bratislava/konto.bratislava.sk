-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeceased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "markedDeceasedAt" TIMESTAMP(3);
