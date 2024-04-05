/*
  Warnings:

  - You are about to drop the `EnginePrices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "EnginePrices";

-- CreateTable
CREATE TABLE "EnginePrice" (
    "id" TEXT NOT NULL,
    "engineCode" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnginePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnginePrice_engineCode_key" ON "EnginePrice"("engineCode");
