-- AlterTable
ALTER TABLE "Exporting" ADD COLUMN     "exportingListId" TEXT;

-- CreateTable
CREATE TABLE "ExportingList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportingList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exporting" ADD CONSTRAINT "Exporting_exportingListId_fkey" FOREIGN KEY ("exportingListId") REFERENCES "ExportingList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportingList" ADD CONSTRAINT "ExportingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
