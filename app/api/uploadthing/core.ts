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
            const timestamp = new Date().toISOString()
            const logContext = {
                userId: metadata.userId,
                fileKey: file.key,
                fileUrl: file.url,
                timestamp,
            }

            try {
                // Log the start of upload completion
                console.log(
                    '[UploadThing] Starting upload completion:',
                    logContext
                )

                // Construct the response with the file URL
                const response = {
                    url: file.url || `https://utfs.io/f/${file.key}`,
                    key: file.key,
                    timestamp,
                }

                // Log successful completion
                console.log('[UploadThing] Upload completed successfully:', {
                    ...logContext,
                    response,
                })

                return response
            } catch (error) {
                // Log error with full context
                console.error('[UploadThing] Error in upload completion:', {
                    ...logContext,
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
