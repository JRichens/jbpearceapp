import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        .middleware(async () => {
            try {
                const { userId } = auth()
                console.log('[UploadThing] Middleware executing:', {
                    userId,
                    appId: process.env.UPLOADTHING_APP_ID,
                    timestamp: new Date().toISOString(),
                })

                if (!userId) {
                    console.error('[UploadThing] Auth failed - no userId')
                    throw new Error('Unauthorized: No user ID')
                }

                return { userId }
            } catch (error) {
                console.error('[UploadThing] Middleware error:', {
                    error,
                    timestamp: new Date().toISOString(),
                })
                throw error
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const timestamp = new Date().toISOString()
            const uploadId = Math.random().toString(36).substring(7)

            try {
                // Enhanced logging with upload details
                console.log('[UploadThing] Starting upload completion:', {
                    userId: metadata.userId,
                    appId: process.env.UPLOADTHING_APP_ID,
                    uploadId,
                    timestamp,
                    fileDetails: {
                        size: file.size,
                        name: file.name,
                        type: file.type,
                        key: file.key,
                    },
                })

                // Construct and validate the URL
                const fileUrl = file.url || `https://utfs.io/f/${file.key}`

                // Construct response with additional metadata
                const response = {
                    url: fileUrl,
                    key: file.key,
                    timestamp,
                    uploadId,
                    size: file.size,
                    name: file.name,
                    type: file.type,
                }

                // Add a small delay before sending response
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Log successful completion
                console.log('[UploadThing] Upload completed successfully:', {
                    userId: metadata.userId,
                    uploadId,
                    fileUrl,
                    timestamp,
                })

                return response
            } catch (error) {
                // Log error with full context
                console.error('[UploadThing] Error in upload completion:', {
                    userId: metadata.userId,
                    uploadId,
                    fileKey: file.key,
                    timestamp,
                    error:
                        error instanceof Error
                            ? {
                                  message: error.message,
                                  stack: error.stack,
                              }
                            : 'Unknown error',
                })

                throw error
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter
