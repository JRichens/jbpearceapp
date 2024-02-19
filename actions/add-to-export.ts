"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addToExport(reg: string) {
  // first see if car reg is already exported

  const isCarExported = await db.car.findUnique({
    where: {
      reg,
      exportVehicle: true,
    },
  })

  if (isCarExported) {
    console.log("Car is already exported")
  } else {
    try {
      await db.car.update({
        where: {
          reg,
        },
        data: {
          exportVehicle: true,
          // Date as of now added to export
          addedToExport: new Date(),
        },
      })
      console.log(`Vehicle ${reg} added to export`)
    } catch (error) {
      console.log(error)
    }
  }

  revalidatePath("/vehicles")
}
