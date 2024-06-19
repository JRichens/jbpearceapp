/*
  Warnings:

  - You are about to drop the column `SBInote` on the `FarmLandArea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FarmLandArea" DROP COLUMN "SBInote",
ADD COLUMN     "SBIno" TEXT;
