-- AlterTable
ALTER TABLE "RFOByBirthnumber" ADD COLUMN     "citizenId" UUID;

-- AlterTable
ALTER TABLE "UpvsIdentityByUri" ADD COLUMN     "citizenId" UUID;

-- AddForeignKey
ALTER TABLE "RFOByBirthnumber" ADD CONSTRAINT "RFOByBirthnumber_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpvsIdentityByUri" ADD CONSTRAINT "UpvsIdentityByUri_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
