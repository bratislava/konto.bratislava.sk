/*
  Warnings:

  - You are about to drop the `UpvsIdentityByUri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UpvsIdentityByUri" DROP CONSTRAINT "UpvsIdentityByUri_physicalEntityId_fkey";

-- DropTable
DROP TABLE "public"."UpvsIdentityByUri";
