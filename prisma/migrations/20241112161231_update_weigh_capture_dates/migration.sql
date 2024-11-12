/*
  Warnings:

  - The `date1` column on the `WeighbridgeCapture` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `date2` column on the `WeighbridgeCapture` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WeighbridgeCapture" ALTER COLUMN "customer" DROP NOT NULL,
ALTER COLUMN "material" DROP NOT NULL,
ALTER COLUMN "weight1" DROP NOT NULL,
DROP COLUMN "date1",
ADD COLUMN     "date1" TIMESTAMP(3),
ALTER COLUMN "weight2" DROP NOT NULL,
DROP COLUMN "date2",
ADD COLUMN     "date2" TIMESTAMP(3),
ALTER COLUMN "weightDeduction" DROP NOT NULL,
ALTER COLUMN "priceDeduction" DROP NOT NULL;
