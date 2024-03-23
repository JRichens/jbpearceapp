-- CreateTable
CREATE TABLE "Breaking" (
    "id" TEXT NOT NULL,
    "carReg" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Breaking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Breaking_carReg_key" ON "Breaking"("carReg");

-- AddForeignKey
ALTER TABLE "Breaking" ADD CONSTRAINT "Breaking_carReg_fkey" FOREIGN KEY ("carReg") REFERENCES "Car"("reg") ON DELETE RESTRICT ON UPDATE CASCADE;
