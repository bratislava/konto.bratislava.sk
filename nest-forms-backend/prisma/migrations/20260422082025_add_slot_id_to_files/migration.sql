-- AlterTable
ALTER TABLE "public"."Files" ADD COLUMN     "slotId" TEXT;

-- CreateIndex
CREATE INDEX "Files_formId_slotId_status_idx" ON "public"."Files"("formId", "slotId", "status");
