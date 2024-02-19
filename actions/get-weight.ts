"use server"

import { db } from "@/lib/db"

export async function GetWeight() {
  const latestWeightEntry = await db.saveweight.findFirst({})

  if (!latestWeightEntry) {
    throw new Error("No weight entries found")
  }

  return latestWeightEntry
}
