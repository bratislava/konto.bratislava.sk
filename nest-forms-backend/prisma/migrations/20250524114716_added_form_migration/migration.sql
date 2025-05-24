-- CreateTable
CREATE TABLE "FormMigration" (
    "id" TEXT NOT NULL,
    "cognitoAuthSub" UUID NOT NULL,
    "cognitoGuestIdentityId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormMigration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormMigration_cognitoAuthSub_expiresAt_idx" ON "FormMigration"("cognitoAuthSub", "expiresAt");

-- CreateIndex
CREATE INDEX "FormMigration_cognitoGuestIdentityId_expiresAt_idx" ON "FormMigration"("cognitoGuestIdentityId", "expiresAt");

-- CreateIndex
CREATE INDEX "FormMigration_expiresAt_idx" ON "FormMigration"("expiresAt");
