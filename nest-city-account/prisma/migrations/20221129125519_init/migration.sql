-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,
    "azureId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "emailVerified" BOOLEAN,
    "phoneVerified" BOOLEAN,
    "authLevel" TEXT,
    "birthNumber" TEXT,
    "uri" TEXT,
    "birthDate" DATE,
    "originCity" TEXT,
    "actualCity" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGdprData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subType" TEXT NOT NULL,

    CONSTRAINT "UserGdprData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_azureId_key" ON "User"("azureId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserGdprData" ADD CONSTRAINT "UserGdprData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
