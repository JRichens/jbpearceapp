"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NewLandArea } from "@/types/land-area"
import { LandArea } from "@prisma/client"
import { revalidatePath } from "next/cache"

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
  ownership: string,
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
        ownership: ownership,
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

export async function UpdateLandAreaNotes(id: string, notes: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    let user

    if (!userId) {
      throw new Error("User must be authenticated")
    } else {
      user = await db.user.findFirst({
        where: {
          clerkId: userId,
        },
      })
    }
    // Check the userType and if land and if notes different, update notesRead
    const currentNotes = await db.landArea.findFirst({
      where: {
        id,
      },
      select: {
        notes: true,
      },
    })
    // If the notes are the same just return
    if (currentNotes?.notes === notes || (!currentNotes?.notes && !notes)) {
      return
    } else {
      await db.landArea.update({
        where: {
          id,
        },
        data: {
          notes: notes,
        },
      })
      // If a land user has modified notes, said notesRead false
      if (user?.userTypeId === "land") {
        await db.landArea.update({
          where: {
            id: id,
          },
          data: {
            notesRead: false,
          },
        })
      }
    }
    return
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function UpdateLandAreasNotesRead(id: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    let user

    if (!userId) {
      throw new Error("User must be authenticated")
    } else {
      user = await db.user.findFirst({
        where: {
          clerkId: userId,
        },
      })
    }

    // if the user is a land user, return otherwise, notesRead = true
    if (user?.userTypeId === "land") {
      return
    } else {
      await db.landArea.update({
        where: {
          id,
        },
        data: {
          notesRead: true,
        },
      })
    }
    revalidatePath("/land-areas")
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function GetLandAreasNotesRead() {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.landArea.findMany({
      where: {
        notesRead: false,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function GetLandAreaNotes(id: string) {
  try {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
      throw new Error("User must be authenticated")
    }
    return await db.landArea.findFirst({
      where: {
        id,
      },
      select: {
        notes: true,
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
