/*
  Warnings:

  - You are about to drop the `Reminders` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MOTStatus" AS ENUM ('Valid', 'Expired', 'Upcoming', 'Booked', 'Ignore');

-- CreateEnum
CREATE TYPE "TAXStatus" AS ENUM ('Taxed', 'Untaxed', 'Upcoming', 'Ignore');

-- DropForeignKey
ALTER TABLE "Reminders" DROP CONSTRAINT "Reminders_companyVehicleId_fkey";

-- AlterTable
ALTER TABLE "CompanyVehicles" ADD COLUMN     "MOTdate" TEXT NOT NULL DEFAULT '2020-01-01',
ADD COLUMN     "MOTdays" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "MOTstatus" "MOTStatus" NOT NULL DEFAULT 'Ignore',
ADD COLUMN     "TAXdate" TEXT NOT NULL DEFAULT '2020-01-01',
ADD COLUMN     "TAXdays" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "TAXstatus" "TAXStatus" NOT NULL DEFAULT 'Ignore';

-- DropTable
DROP TABLE "Reminders";
