/*
  Warnings:

  - A unique constraint covering the columns `[uri]` on the table `ExternalEdeskCheck` will be added. If there are existing duplicate values, this will fail.

  - A unique constraint covering the columns `[norisId]` on the table `ExternalEdeskCheck` will be added. If there are existing duplicate values, this will fail.
*/

-- Delete all external edesk checks
DELETE FROM "ExternalEdeskCheck";

-- AlterEnum
ALTER TYPE "QueueItemStatusEnum" ADD VALUE 'NEW_URI_CHECK_REQUIRED';

-- AlterTable
ALTER TABLE "PhysicalEntity" ADD COLUMN     "uriPossiblyOutdated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEdeskCheck_uri_key" ON "ExternalEdeskCheck"("uri");

-- AlterTable
ALTER TABLE "ExternalEdeskCheck" ADD COLUMN     "newUri" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEdeskCheck_norisId_key" ON "ExternalEdeskCheck"("norisId");
