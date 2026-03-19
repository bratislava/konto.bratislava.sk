/*
  Warnings:

  - A unique constraint covering the columns `[uri]` on the table `ExternalEdeskCheck` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterEnum
ALTER TYPE "QueueItemStatusEnum" ADD VALUE 'NEW_URI_CHECK_REQUIRED';

-- AlterTable
ALTER TABLE "PhysicalEntity" ADD COLUMN     "uriPossiblyOutdated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEdeskCheck_uri_key" ON "ExternalEdeskCheck"("uri");

-- AlterTable
ALTER TABLE "ExternalEdeskCheck" ADD COLUMN     "newUri" TEXT;

-- Requeue all failed external edesk checks
UPDATE "ExternalEdeskCheck" SET "queueStatus" = 'PENDING' WHERE "queueStatus" = 'FAILED'
