-- CreateTable
CREATE TABLE "weightcapture" (
    "id" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "weightcapture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "weightcapture" ADD CONSTRAINT "weightcapture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
