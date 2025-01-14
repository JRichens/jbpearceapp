import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        .middleware(async () => {
            try {
                const { userId } = auth()
                console.log('Middleware executing for user:', userId)

                if (!userId) {
                    console.error('No userId found in auth')
                    throw new Error('Unauthorized: No user ID')
                }

                return { userId }
            } catch (error) {
                console.error('Error in uploadthing middleware:', error)
                throw error
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            try {
                console.log('Upload complete for userId:', metadata.userId)
                console.log('File URL:', file.url)

                return { url: file.url }
            } catch (error) {
                console.error('Error in onUploadComplete:', error)
                throw error
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter
