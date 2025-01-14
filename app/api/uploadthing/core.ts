import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        .onUploadError(({ error, fileKey }) => {
            throw error
        })
        .middleware(async () => {
            try {
                const { userId } = auth()
                if (!userId) {
                    throw new Error('Unauthorized: No user ID')
                }

                return { userId }
            } catch (error) {
                throw error
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const timestamp = new Date().toISOString()
            const logPrefix = '[UploadThing]'

            try {
                const response = {
                    url: `https://utfs.io/f/${file.key}`,
                    key: file.key,
                    name: file.name,
                    size: file.size,
                    timestamp,
                }

                return response
            } catch (error) {
                const timestamp = new Date().toISOString()
                throw error
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter
