"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NewFarmLandArea } from "@/types/land-area"
import { LandArea } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function AddLandArea({
  newFarmLandArea,
}: {
  newFarmLandArea: NewFarmLandArea
}) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.farmLandArea.create({
      data: {
        ...newFarmLandArea,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function GetLandArea(id: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.farmLandArea.findFirst({
      where: {
        parcelId: id,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function GetAllLandAreas() {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.farmLandArea.findMany()
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function UpdateLandAreaSTid(
  featureId: string,
  SHEET_ID: string,
  PARCEL_ID: string
) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    let farmLandArea = await db.farmLandArea.findFirst({
      where: {
        parcelId: featureId,
      },
    })
    return await db.farmLandArea.update({
      where: {
        id: farmLandArea?.id,
      },
      data: {
        STid: SHEET_ID + " " + PARCEL_ID,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function UpdateLandArea(
  id: string,
  parcelId: string,
  STid: string,
  name: string,
  description: string,
  activityCode: string,
  hectares: string,
  acres: string,
  SBIno: string,
  colour: string
) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.farmLandArea.update({
      where: {
        id,
      },
      data: {
        parcelId: parcelId,
        STid: STid,
        name: name,
        description: description,
        activityCode: activityCode,
        hectares: hectares,
        acres: acres,
        SBIno: SBIno,
        colour: colour,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function DeleteLandArea(id: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.farmLandArea.delete({
      where: {
        id,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}
