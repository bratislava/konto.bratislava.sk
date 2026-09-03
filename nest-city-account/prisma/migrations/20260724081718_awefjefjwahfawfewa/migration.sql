/*
  Warnings:

  - Changed the type of `commandName` on the `BloomreachOutbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BloomreachOutbox" DROP COLUMN "commandName",
ADD COLUMN     "commandName" "BloomreachCommandName" NOT NULL;

-- CreateIndex
CREATE INDEX "BloomreachOutbox_externalId_commandName_status_idx" ON "BloomreachOutbox"("externalId", "commandName", "status");
