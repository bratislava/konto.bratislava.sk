-- CreateTable
CREATE TABLE "public"."FormRegistrationStatus" (
    "slug" TEXT NOT NULL,
    "pospId" TEXT NOT NULL,
    "pospVersion" TEXT NOT NULL,
    "isRegistered" BOOLEAN NOT NULL,

    CONSTRAINT "FormRegistrationStatus_pkey" PRIMARY KEY ("slug","pospId","pospVersion")
);
