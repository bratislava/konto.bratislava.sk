/*
  Warnings:

  - A unique constraint covering the columns `[authorizationCode]` on the table `OAuth2Data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OAuth2Data_authorizationCode_key" ON "OAuth2Data"("authorizationCode");
