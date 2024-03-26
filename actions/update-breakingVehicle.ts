"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

type BreakingOptional = {
  id: string
  carReg: string
  created?: Date
  updated?: Date
  photos?: string[]
}

export async function UpdateBreakingVehicle(vehicle: BreakingOptional) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the vehicle in the database
  try {
    const breakingVehicle = await db.breaking.update({
      data: {
        ...vehicle,
      },
      where: {
        carReg: vehicle.carReg,
      },
    })
    revalidatePath("/vehicles-breaking")
    return breakingVehicle
  } catch (error) {
    console.error("Error", error)
  }
}
