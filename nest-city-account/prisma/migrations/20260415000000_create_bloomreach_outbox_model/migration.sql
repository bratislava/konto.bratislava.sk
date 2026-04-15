-- CreateEnum
CREATE TYPE "BloomreachOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'SUPERSEDED', 'FAILED');

-- CreateTable
CREATE TABLE "BloomreachOutbox"
(
    "id"          uuid                     NOT NULL,
    "createdAt"   TIMESTAMP(3)             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)             NOT NULL,
    "externalId"  TEXT                     NOT NULL,
    "commandName" TEXT                     NOT NULL,
    "commandData" jsonb                    NOT NULL,
    "status"      "BloomreachOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts"    INTEGER                  NOT NULL DEFAULT 0,
    "lastError"   TEXT,

    CONSTRAINT "BloomreachOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BloomreachOutbox_status_createdAt_idx" ON "BloomreachOutbox" ("status", "createdAt");

-- CreateIndex
CREATE INDEX "BloomreachOutbox_externalId_commandName_status_idx" ON "BloomreachOutbox" ("externalId", "commandName", "status");