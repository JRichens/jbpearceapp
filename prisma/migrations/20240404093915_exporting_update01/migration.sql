-- CreateTable
CREATE TABLE "Exporting" (
    "id" TEXT NOT NULL,
    "carReg" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "photos" TEXT[],

    CONSTRAINT "Exporting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exporting_carReg_key" ON "Exporting"("carReg");

-- AddForeignKey
ALTER TABLE "Exporting" ADD CONSTRAINT "Exporting_carReg_fkey" FOREIGN KEY ("carReg") REFERENCES "Car"("reg") ON DELETE RESTRICT ON UPDATE CASCADE;
