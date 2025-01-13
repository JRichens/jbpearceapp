import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        .middleware(async () => {
            const { userId } = auth()
            console.log('Middleware executing for user:', userId) // Add this log
            if (!userId) throw new Error('Unauthorized')
            return { userId }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Upload complete for userId:', metadata.userId)
            console.log('File URL:', file.url)
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter // Add this line
