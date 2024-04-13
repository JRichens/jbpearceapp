"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

export async function AddBreakingVehicle(reg: string) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the user in the database
  try {
    // First see if exists in exporting vehicle
    const exportVehicle = await db.exporting.findUnique({
      where: {
        carReg: reg,
      },
    })

    const breakingVehicle = await db.exporting.create({
      data: {
        carReg: reg,
      },
    })

    if (breakingVehicle && exportVehicle) {
      await db.exporting.delete({
        where: {
          carReg: reg,
        },
      })
    }
    revalidatePath("/vehicles-breaking")
    return breakingVehicle
  } catch (error) {
    console.error("Error", error)
  }
}
