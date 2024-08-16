-- CreateTable
CREATE TABLE "CompanyVehicles" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "company" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CompanyVehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminders" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderDays" INTEGER NOT NULL DEFAULT 60,
    "completed" BOOLEAN DEFAULT false,
    "userCompleted" TEXT NOT NULL,
    "companyVehicleId" TEXT NOT NULL,

    CONSTRAINT "Reminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminders" ADD CONSTRAINT "Reminders_companyVehicleId_fkey" FOREIGN KEY ("companyVehicleId") REFERENCES "CompanyVehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
