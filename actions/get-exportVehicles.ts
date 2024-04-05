"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GetExportVehicles() {
  const { userId }: { userId: string | null } = auth()

  if (userId) {
    try {
      const vehicles = await db.exporting.findMany({
        include: {
          car: true,
        },
      })
      const enginePrices = await db.enginePrice.findMany()

      // Then for each vehicle find associated enginePrice

      vehicles.forEach((vehicle) => {
        const enginePrice = enginePrices.find(
          (enginePrice) => enginePrice.engineCode === vehicle.car.engineCode
        )
        if (enginePrice) {
          vehicle.car.enginePrice = enginePrice.price
        }
      })

      return vehicles
    } catch (error) {
      console.log(error)
    }
  }
}
