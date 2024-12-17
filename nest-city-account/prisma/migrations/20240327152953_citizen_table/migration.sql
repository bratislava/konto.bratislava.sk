-- AlterTable
ALTER TABLE "User" ADD COLUMN     "citizenId" UUID;

-- CreateTable
CREATE TABLE "Citizen" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,
    "uri" TEXT,
    "ifo" TEXT,
    "birthNumber" TEXT,

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFOByBirthnumber" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthNumber" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "RFOByBirthnumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpvsIdentityByUri" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uri" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "UpvsIdentityByUri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_uri_key" ON "Citizen"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_ifo_key" ON "Citizen"("ifo");
