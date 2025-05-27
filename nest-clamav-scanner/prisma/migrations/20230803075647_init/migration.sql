-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('ACCEPTED', 'QUEUED', 'SCANNING', 'SAFE', 'INFECTED', 'NOT_FOUND', 'MOVE_ERROR_SAFE', 'MOVE_ERROR_INFECTED', 'SCAN_ERROR', 'SCAN_TIMEOUT', 'SCAN_NOT_SUCCESSFUL', 'FORM_ID_NOT_FOUND');

-- CreateTable
CREATE TABLE "Files" (
    "id" TEXT NOT NULL,
    "fileUid" TEXT NOT NULL,
    "bucketUid" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileMimeType" TEXT NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'ACCEPTED',
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Files_fileUid_bucketUid_fileSize_status_notified_idx" ON "Files"("fileUid", "bucketUid", "fileSize", "status", "notified");
