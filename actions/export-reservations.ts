"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

export async function AddReservation(vehicleId: string) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  try {
    const reservation = await db.reservation.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        breaking: {
          connect: {
            id: vehicleId,
          },
        },
      },
    })
    revalidatePath("/vehicles-export")
    return reservation
  } catch (error) {
    console.error("Error", error)
  }
}
