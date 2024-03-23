/*
  Warnings:

  - You are about to drop the column `parcelId` on the `LandArea` table. All the data in the column will be lost.
  - You are about to drop the column `sheetId` on the `LandArea` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LandArea_id_key";

-- AlterTable
ALTER TABLE "LandArea" DROP COLUMN "parcelId",
DROP COLUMN "sheetId",
ADD COLUMN     "STid" TEXT NOT NULL DEFAULT 'ST0000 0000',
ADD COLUMN     "centerLat" DOUBLE PRECISION,
ADD COLUMN     "centerLng" DOUBLE PRECISION,
ADD CONSTRAINT "LandArea_pkey" PRIMARY KEY ("id");
