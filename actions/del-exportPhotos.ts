'use server'

import { UTApi } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

const utapi = new UTApi()

export async function DeleteExportPhoto(
    photo: string,
    carReg: string,
    newPhotos: string[]
) {
    const { userId }: { userId: string | null } = auth()

    if (userId) {
        try {
            await utapi.deleteFiles(photo)
            console.log(`${userId} Deleted Photo: ${photo} from ${carReg}`)

            // Update the database with the new photos array
            await db.exporting.update({
                where: {
                    carReg: carReg,
                },
                data: {
                    photos: newPhotos,
                },
            })

            revalidatePath('/vehicles-export')
        } catch (error) {
            console.log(error)
        }
    }
}
