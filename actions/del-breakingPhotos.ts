'use server'

import { UTApi } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const utapi = new UTApi()

export async function DeletePhoto(
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
            await db.breaking.update({
                where: {
                    carReg,
                },
                data: {
                    photos: newPhotos,
                },
            })
            console.log(`${userId} Deleted Photo: ${photo}`)
            revalidatePath('/vehicles-breaking')
        } catch (error) {
            console.log(error)
        }
    }
}
