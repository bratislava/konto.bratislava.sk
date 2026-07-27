-- CreateTable
CREATE TABLE "IdentityLookupRejection"
(
    "id"               uuid         NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "physicalEntityId" uuid         NOT NULL,
    "faultCode"        TEXT,
    "faultReason"      TEXT,

    CONSTRAINT "IdentityLookupRejection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityLookupRejection_physicalEntityId_key" ON "IdentityLookupRejection" ("physicalEntityId");

-- AddForeignKey
ALTER TABLE "IdentityLookupRejection"
    ADD CONSTRAINT "IdentityLookupRejection_physicalEntityId_fkey" FOREIGN KEY ("physicalEntityId") REFERENCES "PhysicalEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
