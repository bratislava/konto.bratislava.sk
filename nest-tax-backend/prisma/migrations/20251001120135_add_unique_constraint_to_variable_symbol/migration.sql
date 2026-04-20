/*
  Warnings:

  - A unique constraint covering the columns `[variableSymbol]` on the table `Tax` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tax_variableSymbol_key" ON "public"."Tax"("variableSymbol");
