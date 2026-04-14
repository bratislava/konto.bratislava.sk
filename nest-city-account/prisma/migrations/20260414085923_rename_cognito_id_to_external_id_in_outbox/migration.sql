/*
  Warnings:

  - You are about to drop the column `cognitoId` on the `BloomreachOutbox` table. All the data in the column will be lost.
  - Added the required column `externalId` to the `BloomreachOutbox` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."BloomreachOutbox_cognitoId_commandName_status_idx";

-- AlterTable
ALTER TABLE "BloomreachOutbox" DROP COLUMN "cognitoId",
ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BloomreachOutbox_externalId_commandName_status_idx" ON "BloomreachOutbox"("externalId", "commandName", "status");
