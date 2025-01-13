'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function DelBreakingVehicle(reg: string) {
    // Validate that a userId is present.
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    // First find if any associate photos, then delete them from hosting
    try {
        const vehicle = await db.breaking.findFirst({
            where: {
                carReg: reg,
            },
        })
        const photos = vehicle?.photos
        // Loop through the photos, isolate the filename and delete from hosting
        if (photos) {
            photos.forEach(async (photo) => {
                const fileName = photo.split('/').pop()
                fileName && (await utapi.deleteFiles(fileName))
                console.log(`${userId} Deleted Photo: ${photo}`)
            })
        }
    } catch (error) {
        console.error('Error', error)
    }

    // Then delete the database entry
    try {
        await db.breaking.delete({
            where: {
                carReg: reg,
            },
        })
        revalidatePath('/vehicles-breaking')
    } catch (error) {
        console.error('Error', error)
    }
}
