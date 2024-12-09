-- CreateTable
CREATE TABLE "LegalPerson" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "email" TEXT NOT NULL,
    "ico" TEXT,
    "birthNumber" TEXT,
    "lastVerificationIdentityCard" TIMESTAMP(3),
    "oldMagproxyDatabase" INTEGER NOT NULL DEFAULT 0,
    "requeuedInVerification" INTEGER NOT NULL DEFAULT 0,
    "birthnumberAlreadyExistsLast" TEXT,
    "birthnumberAlreadyExistsCounter" INTEGER NOT NULL DEFAULT 0,
    "userAttribute" TEXT,

    CONSTRAINT "LegalPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPerson_externalId_key" ON "LegalPerson"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPerson_email_key" ON "LegalPerson"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPerson_ico_birthNumber_key" ON "LegalPerson"("ico", "birthNumber");
