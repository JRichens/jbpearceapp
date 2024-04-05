"use server"

import { utapi } from "@/server/uploadthing"
import { auth } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function DeleteExportPhoto(
  photo: string,
  carReg: string,
  newPhotos: string[]
) {
  const { userId }: { userId: string | null } = auth()

  if (userId) {
    try {
      // First remove it from the photo server UploadThing
      await utapi.deleteFiles(photo)
      // Then remove the database entries
      await db.exporting.update({
        where: {
          carReg,
        },
        data: {
          photos: newPhotos,
        },
      })
      console.log(`${userId} Deleted Photo: ${photo}`)
      revalidatePath("/vehicles-export")
    } catch (error) {
      console.log(error)
    }
  }
}
