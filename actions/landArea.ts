"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NewLandArea } from "@/types/land-area"
import { LandArea } from "@prisma/client"

export async function AddLandArea({
  newLandArea,
}: {
  newLandArea: NewLandArea
}) {
  const {
    issuedDate,
    plotNo,
    registryNo,
    purchaseDate,
    purchasePrice,
    name,
    STid,
    description,
    area,
    colour,
    centerLat,
    centerLng,
    coordinates,
  } = newLandArea
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.landArea.create({
      data: {
        issuedDate: issuedDate,
        plotNo: plotNo,
        registryNo: registryNo,
        purchaseDate: purchaseDate,
        purchasePrice: purchasePrice,
        name: name,
        STid: STid,
        description: description,
        area: area,
        colour: colour,
        centerLat: centerLat,
        centerLng: centerLng,
        coordinates: coordinates,
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
    return await db.landArea.findFirst({
      where: {
        id: id,
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
    return await db.landArea.findMany()
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function UpdateLandAreaSTid(id: string, STid: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.landArea.update({
      where: {
        id,
      },
      data: {
        STid: STid,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function UpdateLandArea(
  id: string,
  plotNo: string,
  registryNo: string,
  plotName: string,
  purchaseDate: string,
  purchasePrice: number,
  STid: string,
  description: string,
  colour: string,
  area: string
) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.landArea.update({
      where: {
        id,
      },
      data: {
        plotNo: plotNo,
        registryNo: registryNo,
        name: plotName,
        description: description,
        purchaseDate: purchaseDate,
        purchasePrice: purchasePrice,
        STid: STid,
        colour: colour,
        area: area,
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
    return await db.landArea.delete({
      where: {
        id,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}
