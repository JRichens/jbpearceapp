"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache"

export async function GetEnginePrice(engineCode: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.enginePrice.findFirst({
      where: {
        engineCode: engineCode,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

export async function AddEnginePrice(engineCode: string, price: number) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Create the engine price in the database
  try {
    const enginePrice = await db.enginePrice.create({
      data: {
        engineCode: engineCode,
        price: price,
      },
    })
    revalidatePath("/vehicles-export")
    return enginePrice
  } catch (error) {
    console.error("Error", error)
  }
}

export async function UpdateEnginePrice(engineCode: string, price: number) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // First check if we need to create a new engine and price
  const enginePrice = await db.enginePrice.findFirst({
    where: {
      engineCode: engineCode,
    },
  })

  if (!enginePrice) {
    await AddEnginePrice(engineCode, price)
  }

  // Update the engine price in the database
  try {
    const enginePrice = await db.enginePrice.update({
      where: {
        engineCode: engineCode,
      },
      data: {
        price: price,
      },
    })
    revalidatePath("/vehicles-export")
    return enginePrice
  } catch (error) {
    console.error("Error", error)
  }
}
