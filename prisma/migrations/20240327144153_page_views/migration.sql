-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageViewDay" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "pageViewId" TEXT NOT NULL,

    CONSTRAINT "PageViewDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PageViewDayToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PageViewDayToUser_AB_unique" ON "_PageViewDayToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PageViewDayToUser_B_index" ON "_PageViewDayToUser"("B");

-- AddForeignKey
ALTER TABLE "PageViewDay" ADD CONSTRAINT "PageViewDay_pageViewId_fkey" FOREIGN KEY ("pageViewId") REFERENCES "PageView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageViewDayToUser" ADD CONSTRAINT "_PageViewDayToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PageViewDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageViewDayToUser" ADD CONSTRAINT "_PageViewDayToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
