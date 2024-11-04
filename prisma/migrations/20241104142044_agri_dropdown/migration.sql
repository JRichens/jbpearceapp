/*
  Warnings:

  - The values [Ignore] on the enum `MOTStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Ignore] on the enum `TAXStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MOTStatus_new" AS ENUM ('Valid', 'Expired', 'Upcoming', 'Booked', 'Agri', 'NA');
ALTER TABLE "CompanyVehicles" ALTER COLUMN "MOTstatus" DROP DEFAULT;
ALTER TABLE "CompanyVehicles" ALTER COLUMN "MOTstatus" TYPE "MOTStatus_new" USING ("MOTstatus"::text::"MOTStatus_new");
ALTER TYPE "MOTStatus" RENAME TO "MOTStatus_old";
ALTER TYPE "MOTStatus_new" RENAME TO "MOTStatus";
DROP TYPE "MOTStatus_old";
ALTER TABLE "CompanyVehicles" ALTER COLUMN "MOTstatus" SET DEFAULT 'Valid';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TAXStatus_new" AS ENUM ('Taxed', 'Untaxed', 'Upcoming', 'SORN');
ALTER TABLE "CompanyVehicles" ALTER COLUMN "TAXstatus" DROP DEFAULT;
ALTER TABLE "CompanyVehicles" ALTER COLUMN "TAXstatus" TYPE "TAXStatus_new" USING ("TAXstatus"::text::"TAXStatus_new");
ALTER TYPE "TAXStatus" RENAME TO "TAXStatus_old";
ALTER TYPE "TAXStatus_new" RENAME TO "TAXStatus";
DROP TYPE "TAXStatus_old";
ALTER TABLE "CompanyVehicles" ALTER COLUMN "TAXstatus" SET DEFAULT 'Taxed';
COMMIT;
