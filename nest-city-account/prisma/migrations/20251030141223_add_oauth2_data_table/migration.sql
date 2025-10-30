-- CreateTable
CREATE TABLE "OAuth2Data" (
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
    "authorizationCode" TEXT,
    "accessTokenEnc" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "idTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,

    CONSTRAINT "OAuth2Data_pkey" PRIMARY KEY ("id")
);
