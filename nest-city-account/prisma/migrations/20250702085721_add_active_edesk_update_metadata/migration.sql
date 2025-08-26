-- AlterTable
ALTER TABLE "PhysicalEntity" ADD COLUMN     "activeEdeskUpdateFailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "activeEdeskUpdateFailedAt" TIMESTAMP(3),
ADD COLUMN     "activeEdeskUpdatedAt" TIMESTAMP(3);
