/*
  Warnings:

  - You are about to drop the `MaterialWeigh` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeighbridgeCapture` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MaterialWeigh";

-- DropTable
DROP TABLE "WeighbridgeCapture";

-- CreateTable
CREATE TABLE "WeighbridgeTicket" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "driver" TEXT NOT NULL,
    "customer" TEXT,
    "notes" TEXT,

    CONSTRAINT "WeighbridgeTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMaterial" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "material" TEXT,
    "weight1" TEXT,
    "date1" TIMESTAMP(3),
    "weight2" TEXT,
    "date2" TIMESTAMP(3),
    "weightDeduction" TEXT,
    "priceDeduction" TEXT,
    "weighbridgeTicketId" TEXT NOT NULL,

    CONSTRAINT "TicketMaterial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketMaterial" ADD CONSTRAINT "TicketMaterial_weighbridgeTicketId_fkey" FOREIGN KEY ("weighbridgeTicketId") REFERENCES "WeighbridgeTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
