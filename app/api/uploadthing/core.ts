import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
    ebayPhotos: f({ image: { maxFileSize: '16MB', maxFileCount: 24 } })
        .onUploadError(({ error, fileKey }) => {
            console.error('[UploadThing] Upload error occurred:', {
                errorMessage: error.message,
                errorCode: error.code,
                fileKey,
                timestamp: new Date().toISOString(),
            })
            throw error
        })
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
            console.log('[UploadThing] Upload completed on server:', {
                userId: metadata.userId,
                fileKey: file.key,
                fileName: file.name,
                fileSize: file.size,
                timestamp: new Date().toISOString(),
            })

            try {
                // Construct and return minimal response
                return {
                    url: `https://utfs.io/f/${file.key}`,
                    key: file.key,
                }
            } catch (error) {
                const timestamp = new Date().toISOString()
                console.error('[UploadThing] Error in upload completion:', {
                    userId: metadata.userId,
                    fileKey: file.key,
                    timestamp,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                })
                throw error
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
export default uploadRouter
