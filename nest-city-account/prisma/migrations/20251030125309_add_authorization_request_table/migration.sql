-- CreateTable
CREATE TABLE "AuthorizationRequest" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responseType" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scope" TEXT,
    "state" TEXT,
    "codeChallenge" TEXT,
    "codeChallengeMethod" TEXT,

    CONSTRAINT "AuthorizationRequest_pkey" PRIMARY KEY ("id")
);
