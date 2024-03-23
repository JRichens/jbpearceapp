/*
  Warnings:

  - You are about to drop the column `county` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "county",
ADD COLUMN     "postcode" TEXT;
