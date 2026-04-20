-- CreateEnum
CREATE TYPE "QueueItemStatusEnum" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ExternalEdeskCheck" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uri" TEXT,
    "queueStatus" "QueueItemStatusEnum" NOT NULL DEFAULT 'PENDING',
    "upvsStatus" TEXT,
    "edeskStatus" TEXT,
    "edeskNumber" TEXT,
    "processedAt" TIMESTAMP(3),
    "failCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExternalEdeskCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalEdeskCheck_queueStatus_idx" ON "ExternalEdeskCheck"("queueStatus");

-- CreateIndex
CREATE INDEX "ExternalEdeskCheck_createdAt_idx" ON "ExternalEdeskCheck"("createdAt");
