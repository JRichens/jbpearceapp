-- CreateTable
CREATE TABLE "FarmLandArea" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "STid" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Land Name',
    "description" TEXT NOT NULL DEFAULT 'Land Description',
    "activityCode" TEXT,
    "hectares" TEXT NOT NULL,
    "acres" TEXT NOT NULL,
    "colour" TEXT NOT NULL DEFAULT '#008B02',
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "coordinates" TEXT[],

    CONSTRAINT "FarmLandArea_pkey" PRIMARY KEY ("id")
);
