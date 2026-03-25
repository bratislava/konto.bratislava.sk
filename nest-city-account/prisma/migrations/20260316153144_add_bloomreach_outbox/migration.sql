-- CreateTable
CREATE TABLE "BloomreachOutbox" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "eventType" TEXT NOT NULL,
    "externalId" UUID NOT NULL,
    "phoneNumber" TEXT,

    CONSTRAINT "BloomreachOutbox_pkey" PRIMARY KEY ("id")
);
