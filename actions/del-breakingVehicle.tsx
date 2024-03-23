"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

export async function DelBreakingVehicle(reg: string) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the user in the database
  try {
    await db.breaking.delete({
      where: {
        carReg: reg,
      },
    })
    revalidatePath("/vehicles-breaking")
  } catch (error) {
    console.error("Error", error)
  }
}
