'use server'

import { UTApi } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

const utapi = new UTApi()

export async function DeletePhoto(photo: string) {
    const { userId }: { userId: string | null } = auth()

    if (userId) {
        try {
            await utapi.deleteFiles(photo)
            console.log(`${userId} Deleted Photo: ${photo}`)
            revalidatePath('/vehicles-export')
        } catch (error) {
            console.log(error)
        }
    }
}
