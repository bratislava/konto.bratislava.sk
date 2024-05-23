/*
  Warnings:

  - A unique constraint covering the columns `[ginisDocumentId]` on the table `Forms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GinisState" AS ENUM ('CREATED', 'RUNNING_REGISTER', 'REGISTERED', 'RUNNING_UPLOAD_ATTACHMENTS', 'ATTACHMENTS_UPLOADED', 'RUNNING_EDIT_SUBMISSION', 'SUBMISSION_EDITED', 'RUNNING_ASSIGN_SUBMISSION', 'SUBMISSION_ASSIGNED', 'FINISHED', 'ERROR_REGISTER', 'ERROR_ATTACHMENT_UPLOAD', 'ERROR_EDIT_SUBMISSION', 'ERROR_ASSIGN_SUBMISSION');

-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "ginisUploadedError" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Forms" ADD COLUMN     "ginisState" "GinisState" NOT NULL DEFAULT 'CREATED';

-- AlterTable
ALTER TABLE "SchemaVersion" ADD COLUMN     "ginisOrganizationName" TEXT,
ADD COLUMN     "ginisPersonName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Forms_ginisDocumentId_key" ON "Forms"("ginisDocumentId");
