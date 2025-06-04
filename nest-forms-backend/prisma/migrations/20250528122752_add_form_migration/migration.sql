-- CreateTable
CREATE TABLE "FormMigration" (
    "id" TEXT NOT NULL,
    "cognitoAuthSub" UUID NOT NULL,
    "cognitoGuestIdentityId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormMigration_pkey" PRIMARY KEY ("id")
);
