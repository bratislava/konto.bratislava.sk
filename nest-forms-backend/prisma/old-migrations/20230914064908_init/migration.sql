-- CreateEnum
CREATE TYPE "FormState" AS ENUM ('DRAFT', 'QUEUED', 'DELIVERED_NASES', 'DELIVERED_GINIS', 'READY_FOR_PROCESSING', 'PROCESSING', 'FINISHED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "FormError" AS ENUM ('NONE', 'RABBITMQ_MAX_TRIES', 'FILES_NOT_YET_SCANNED', 'UNABLE_TO_SCAN_FILES', 'INFECTED_FILES', 'NASES_SEND_ERROR');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADED', 'ACCEPTED', 'QUEUED', 'SCANNING', 'SAFE', 'INFECTED', 'NOT_FOUND', 'MOVE_ERROR_SAFE', 'MOVE_ERROR_INFECTED', 'SCAN_ERROR', 'SCAN_TIMEOUT', 'SCAN_NOT_SUCCESSFUL', 'FORM_ID_NOT_FOUND');

-- CreateTable
CREATE TABLE "Forms" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "userExternalId" UUID,
    "email" TEXT,
    "mainUri" TEXT,
    "actorUri" TEXT,
    "state" "FormState" NOT NULL DEFAULT 'DRAFT',
    "error" "FormError" NOT NULL DEFAULT 'NONE',
    "formDataJson" JSONB,
    "formDataGinis" TEXT,
    "senderId" TEXT,
    "recipientId" TEXT,
    "finishSubmission" TIMESTAMP(3),
    "schemaVersionId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Files" (
    "id" TEXT NOT NULL,
    "pospId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "scannerId" TEXT,
    "fileUid" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "messageSubject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latestVersionId" TEXT,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT,
    "pospID" TEXT NOT NULL,
    "pospVersion" TEXT NOT NULL,
    "formDescription" TEXT,
    "data" JSONB NOT NULL,
    "dataXml" TEXT,
    "formFo" TEXT NOT NULL,
    "formHtmlSef" JSONB NOT NULL,
    "formHtml" TEXT NOT NULL,
    "formSbSef" JSONB NOT NULL,
    "formSb" TEXT NOT NULL,
    "jsonSchema" JSONB NOT NULL,
    "schemaXsd" TEXT NOT NULL,
    "uiSchema" JSONB NOT NULL,
    "xmlTemplate" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Files_scannerId_key" ON "Files"("scannerId");

-- CreateIndex
CREATE INDEX "Files_pospId_formId_status_idx" ON "Files"("pospId", "formId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Schema_slug_key" ON "Schema"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Schema_latestVersionId_key" ON "Schema"("latestVersionId");

-- AddForeignKey
ALTER TABLE "Forms" ADD CONSTRAINT "Forms_schemaVersionId_fkey" FOREIGN KEY ("schemaVersionId") REFERENCES "SchemaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "SchemaVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaVersion" ADD CONSTRAINT "SchemaVersion_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
