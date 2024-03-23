-- CreateTable
CREATE TABLE "LandArea" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedDate" TEXT NOT NULL,
    "modified" TIMESTAMP(3) NOT NULL,
    "area" TEXT NOT NULL,
    "coordinates" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "LandArea_id_key" ON "LandArea"("id");
