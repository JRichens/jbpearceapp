/*
  Warnings:

  - A unique constraint covering the columns `[engineCode]` on the table `EnginePrices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EnginePrices_engineCode_key" ON "EnginePrices"("engineCode");
