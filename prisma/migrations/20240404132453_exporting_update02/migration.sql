-- CreateTable
CREATE TABLE "EnginePrices" (
    "id" TEXT NOT NULL,
    "engineCode" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnginePrices_pkey" PRIMARY KEY ("id")
);
