"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

type ExportOptional = {
  id: string
  carReg: string
  created?: Date
  updated?: Date
  photos?: string[]
}

export async function UpdateExportVehicle(vehicle: ExportOptional) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the vehicle in the database
  try {
    const exportVehicle = await db.exporting.update({
      data: {
        ...vehicle,
      },
      where: {
        carReg: vehicle.carReg,
      },
    })
    revalidatePath("/vehicles-export")
    return exportVehicle
  } catch (error) {
    console.error("Error", error)
  }
}
