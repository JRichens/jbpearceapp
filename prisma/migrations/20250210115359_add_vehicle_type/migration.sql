-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Cars', 'Lorries', 'Agri');

-- AlterTable
ALTER TABLE "CompanyVehicles" ADD COLUMN     "vehicleType" "VehicleType" NOT NULL DEFAULT 'Cars';
