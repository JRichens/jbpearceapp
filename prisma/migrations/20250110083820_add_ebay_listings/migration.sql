-- CreateTable
CREATE TABLE "EbayListing" (
    "id" TEXT NOT NULL,
    "carReg" TEXT NOT NULL,
    "partDescription" TEXT NOT NULL,
    "ebayUrl" TEXT NOT NULL,
    "priceListed" DOUBLE PRECISION NOT NULL,
    "dateListed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceSold" DOUBLE PRECISION,
    "dateSold" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EbayListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EbayListing" ADD CONSTRAINT "EbayListing_carReg_fkey" FOREIGN KEY ("carReg") REFERENCES "Car"("reg") ON DELETE RESTRICT ON UPDATE CASCADE;
