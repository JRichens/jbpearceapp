"use server"

import * as xml2js from "xml2js"
import { db } from "./db"
import { currentUser } from "@clerk/nextjs"
import { Car } from "@prisma/client"

export async function getCarDetails(vehicleReg: string) {
  const connectionData = {
    strUserName: "JB_Pearce",
    strPassword: "jz19881945",
    strClientRef: "JB Pearce",
    strClientDescription: "JB Pearce",
    strKey1: "jp06hs2021",
    strVRM: vehicleReg,
    strVersion: "0.31.1",
  }

  try {
    const response = await fetch(
      "https://ws.carwebuk.com/CarweBVRRB2Bproxy/carwebvrrwebservice.asmx/strB2BGetVehicleByVRM",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(connectionData).toString(),
      }
    )

    const xmlData = await response.text()
    return xmlData
  } catch (error) {
    console.error("Error:", error)
  }
}

export async function extractXML(data: string) {
  const parser = new xml2js.Parser({ explicitArray: false })

  let json
  try {
    json = await parser.parseStringPromise(data)
  } catch (err) {
    console.error(err)
    return null
  }

  let vehicleData
  let result
  if (!json?.GetVehicles?.DataArea?.Vehicles?.Vehicle) {
    result = null
  } else {
    vehicleData = json.GetVehicles.DataArea.Vehicles.Vehicle
    result = {
      reg: vehicleData.VRM_Curr,
      vinOriginalDvla: vehicleData.VIN_Original_DVLA,
      dvlaMake: vehicleData.DVLA_Make,
      dvlaModel: vehicleData.DVLA_Model,
      modelSeries: vehicleData.ModelSeries,
      modelVariant: vehicleData.ModelVariantDescription,
      nomCC: vehicleData.Nom_CC,
      colourCurrent: vehicleData.ColourCurrent,
      dvlaYearOfManufacture: vehicleData.DVLAYearOfManufacture,
      originCountry: vehicleData.CountryOfOrigin,
      weight: vehicleData.KerbWeightMin,
      euroStatus: vehicleData.EuroStatus,
      engineCode: vehicleData.EngineModelCode,
      engineCapacity: vehicleData.EngineCapacity,
      noCylinders: vehicleData.NumberOfCylinders,
      fuelType: vehicleData.FuelType,
      transmission: vehicleData.Transmission,
      aspiration: vehicleData.Aspiration,
      maxBHP: vehicleData.MaximumPowerBHP,
      maxTorque: vehicleData.MaximumTorqueLbFt,
      driveType: vehicleData.DriveType,
      gears: vehicleData.ForwardGears,
      vehicleCategory: vehicleData.VehicleCategoryDescription,
      imageUrl: vehicleData.VehicleImageUrl,
    }
  }

  return result
}

export default async function getCarDetailsAsJSON(
  vehicleReg: string
): Promise<Car | null> {
  const user = await currentUser()
  const date = new Date()

  const formattedDate =
    date
      .toLocaleDateString("en-UK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .toUpperCase() +
    " - " +
    date.toLocaleTimeString("en-UK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  console.log(
    `## ${formattedDate} ## ${user?.firstName} ${
      user?.lastName ? user.lastName : ""
    } API Call ####`
  )
  let vehicleCheck: Car | null

  console.log("Checking for vehicle in db")

  try {
    vehicleCheck = await db.car.findUnique({
      where: {
        reg: vehicleReg,
      },
    })
  } catch (error) {
    console.log("Error: getting data", error)
    return null
  }

  if (vehicleCheck) {
    console.log("returning from db")
    console.log(
      `#### ${user?.firstName} ${
        user?.lastName ? user.lastName : ""
      } Finished ####`
    )

    return vehicleCheck
  } else {
    console.log("returning from api")
    const xmlData = await getCarDetails(vehicleReg)
    const jsonData = await extractXML(xmlData as string)
    // first check the jsonData does not have nulls
    if (jsonData?.vinOriginalDvla == null) {
      console.log("Could not find vehicle")
      console.log(
        `#### ${user?.firstName} ${
          user?.lastName ? user.lastName : ""
        } Finished ####`
      )
      return null
    } else {
      console.log("Saving to db")

      try {
        await db.car.create({
          data: {
            ...jsonData,
          },
        })

        vehicleCheck = await db.car.findUnique({
          where: {
            reg: vehicleReg,
          },
        })

        console.log(
          `Saved ${vehicleReg} ${jsonData?.dvlaMake} ${jsonData?.dvlaModel} to db`
        )
      } catch (error) {
        console.error("Error:", error)
      }
    }
    console.log(
      `#### ${user?.firstName} ${
        user?.lastName ? user.lastName : ""
      } Finished ####`
    )
    return vehicleCheck
  }
}
