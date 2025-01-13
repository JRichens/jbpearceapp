import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            const { userId } = auth()

            // If you throw, the user will not be able to upload
            if (!userId) throw new Error('Unauthorized')

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log('Upload complete for userId:', metadata.userId)
            console.log('File URL:', file.url)
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
