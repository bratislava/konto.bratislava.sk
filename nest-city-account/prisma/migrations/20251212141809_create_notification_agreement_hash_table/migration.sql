-- CreateTable
CREATE TABLE "NotificationAgreementHash" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash" VARCHAR(64) NOT NULL,
    "userId" UUID,
    "legalPersonId" UUID,

    CONSTRAINT "NotificationAgreementHash_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "NotificationAgreementHash"
    ADD CONSTRAINT "NotificationAgreementHash_exactly_one_owner"
        CHECK (
            (("userId" IS NOT NULL)::int + ("legalPersonId" IS NOT NULL)::int) = 1
            );

-- CreateIndex
CREATE INDEX "NotificationAgreementHash_hash_idx" ON "NotificationAgreementHash"("hash");

-- CreateIndex
CREATE INDEX "NotificationAgreementHash_userId_idx" ON "NotificationAgreementHash"("userId");

-- CreateIndex
CREATE INDEX "NotificationAgreementHash_legalPersonId_idx" ON "NotificationAgreementHash"("legalPersonId");

-- AddForeignKey
ALTER TABLE "NotificationAgreementHash" ADD CONSTRAINT "NotificationAgreementHash_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAgreementHash" ADD CONSTRAINT "NotificationAgreementHash_legalPersonId_fkey" FOREIGN KEY ("legalPersonId") REFERENCES "LegalPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
