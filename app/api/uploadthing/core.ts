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
            const timestamp = new Date().toISOString()
            const logPrefix = '[UploadThing]'

            try {
                // Log start of completion handler
                console.log(`${logPrefix} Starting onUploadComplete:`, {
                    timestamp,
                    env: process.env.NODE_ENV,
                })

                // Verify file exists
                try {
                    const fileUrl = `https://utfs.io/f/${file.key}`
                    const fileCheck = await fetch(fileUrl, { method: 'HEAD' })

                    if (!fileCheck.ok) {
                        throw new Error(
                            `File verification failed: ${fileCheck.status}`
                        )
                    }

                    console.log(`${logPrefix} File verification successful:`, {
                        fileKey: file.key,
                        status: fileCheck.status,
                        timestamp,
                    })
                } catch (verifyError) {
                    console.error(`${logPrefix} File verification failed:`, {
                        error:
                            verifyError instanceof Error
                                ? verifyError.message
                                : 'Unknown error',
                        fileKey: file.key,
                        timestamp,
                    })
                    throw verifyError
                }

                // Log successful completion
                console.log(`${logPrefix} Upload completed on server:`, {
                    userId: metadata.userId,
                    fileKey: file.key,
                    fileName: file.name,
                    fileSize: file.size,
                    timestamp,
                    url: `https://utfs.io/f/${file.key}`,
                    env: process.env.NODE_ENV,
                    appId: process.env.UPLOADTHING_APP_ID,
                })

                const response = {
                    url: `https://utfs.io/f/${file.key}`,
                    key: file.key,
                    name: file.name,
                    size: file.size,
                    timestamp,
                }

                // Log response being sent
                console.log(`${logPrefix} Sending response:`, {
                    ...response,
                    timestamp,
                })

                return response
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
