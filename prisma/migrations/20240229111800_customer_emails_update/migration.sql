/*
  Warnings:

  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "email",
ADD COLUMN     "emailinvoice" TEXT,
ADD COLUMN     "emailpod" TEXT,
ADD COLUMN     "officephone" TEXT,
ALTER COLUMN "mobile" DROP NOT NULL;
