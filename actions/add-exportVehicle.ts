"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

export async function AddExportVehicle(reg: string) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the user in the database
  try {
    // First see if exists in breaking vehicle
    const breakingVehicle = await db.breaking.findUnique({
      where: {
        carReg: reg,
      },
    })

    const exportVehicle = await db.exporting.create({
      data: {
        carReg: reg,
      },
    })

    if (breakingVehicle && exportVehicle) {
      await db.breaking.delete({
        where: {
          carReg: reg,
        },
      })
    }
    revalidatePath("/vehicles-export")
    return exportVehicle
  } catch (error) {
    console.error("Error", error)
  }
}
