-- CreateTable
CREATE TABLE "UserIdCardVerify" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "birthNumber" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "verifyStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIdCardVerify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPersonIcoIdCardVerify" (
    "id" UUID NOT NULL,
    "legalPersonId" UUID NOT NULL,
    "birthNumber" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "ico" TEXT NOT NULL,
    "verifyStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalPersonIcoIdCardVerify_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserIdCardVerify" ADD CONSTRAINT "UserIdCardVerify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalPersonIcoIdCardVerify" ADD CONSTRAINT "LegalPersonIcoIdCardVerify_legalPersonId_fkey" FOREIGN KEY ("legalPersonId") REFERENCES "LegalPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
