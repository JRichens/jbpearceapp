/*
  Warnings:

  - You are about to drop the column `date1` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `date2` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `priceDeduction` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `weight1` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `weight2` on the `WeighbridgeCapture` table. All the data in the column will be lost.
  - You are about to drop the column `weightDeduction` on the `WeighbridgeCapture` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WeighbridgeCapture" DROP COLUMN "date1",
DROP COLUMN "date2",
DROP COLUMN "material",
DROP COLUMN "priceDeduction",
DROP COLUMN "weight1",
DROP COLUMN "weight2",
DROP COLUMN "weightDeduction",
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "MaterialWeigh" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "material" TEXT,
    "weight1" TEXT,
    "date1" TIMESTAMP(3),
    "weight2" TEXT,
    "date2" TIMESTAMP(3),
    "weightDeduction" TEXT,
    "priceDeduction" TEXT,

    CONSTRAINT "MaterialWeigh_pkey" PRIMARY KEY ("id")
);
