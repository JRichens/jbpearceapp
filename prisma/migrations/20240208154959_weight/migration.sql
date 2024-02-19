-- CreateTable
CREATE TABLE "saveweight" (
    "id" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "stable" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saveweight_pkey" PRIMARY KEY ("id")
);
