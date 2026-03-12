/*
  Warnings:

  - A unique constraint covering the columns `[uri]` on the table `ExternalEdeskCheck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExternalEdeskCheck_uri_key" ON "ExternalEdeskCheck"("uri");
