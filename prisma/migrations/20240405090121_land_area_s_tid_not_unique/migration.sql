-- DropIndex
DROP INDEX "LandArea_STid_key";

-- AlterTable
ALTER TABLE "LandArea" ALTER COLUMN "STid" DROP NOT NULL;
