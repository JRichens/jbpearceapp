/*
  Warnings:

  - A unique constraint covering the columns `[STid]` on the table `LandArea` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LandArea" ALTER COLUMN "STid" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "LandArea_STid_key" ON "LandArea"("STid");
