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
                // Enhanced logging
                console.log('Upload complete event triggered:', {
                    userId: metadata.userId,
                    fileUrl: file.url,
                    fileKey: file.key,
                    timestamp: new Date().toISOString(),
                })

                // Ensure we're returning a properly structured response
                const response = { url: file.url }
                console.log('Sending response:', response)

                return response
            } catch (error) {
                // Enhanced error logging
                console.error('Error in onUploadComplete:', {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    metadata,
                    fileInfo: {
                        key: file.key,
                        url: file.url,
                    },
                })

                // Re-throw the error to ensure proper error handling
                throw error
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter
