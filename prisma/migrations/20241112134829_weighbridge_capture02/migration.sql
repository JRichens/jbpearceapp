/*
  Warnings:

  - Added the required column `driver` to the `WeighbridgeCapture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeighbridgeCapture" ADD COLUMN     "driver" TEXT NOT NULL;
