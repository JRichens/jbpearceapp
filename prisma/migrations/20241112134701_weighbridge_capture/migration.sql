-- CreateTable
CREATE TABLE "WeighbridgeCapture" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "customer" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "weight1" TEXT NOT NULL,
    "date1" TEXT NOT NULL,
    "weight2" TEXT NOT NULL,
    "date2" TEXT NOT NULL,
    "weightDeduction" TEXT NOT NULL,
    "priceDeduction" TEXT NOT NULL,

    CONSTRAINT "WeighbridgeCapture_pkey" PRIMARY KEY ("id")
);
