"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GetBreakingVehicles() {
  const { userId }: { userId: string | null } = auth()

  if (userId) {
    try {
      const vehicles = await db.breaking.findMany({
        include: {
          car: true,
        },
      })

      return vehicles
    } catch (error) {
      console.log(error)
    }
  }
}
