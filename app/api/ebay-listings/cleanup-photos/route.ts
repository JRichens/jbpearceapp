import { NextResponse } from 'next/server'
import { UTApi } from 'uploadthing/server'
import { headers } from 'next/headers'

// Initialize the UploadThing API
const utapi = new UTApi()

// Get the UploadThing secret from environment variables
const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET

export async function DELETE(req: Request) {
    try {
        // Verify the UploadThing secret from request headers
        const headersList = headers()
        const authHeader = headersList.get('x-uploadthing-secret')

        if (!authHeader || authHeader !== UPLOADTHING_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all files from UploadThing
        const files = await utapi.listFiles()

        // Filter for ebay.jpg files
        const ebayPhotos = files.filter(
            (file) =>
                file.name === 'ebay.jpg' &&
                // Only delete files that are fully uploaded
                file.status === 'Uploaded'
        )

        // Delete each file
        const deletePromises = ebayPhotos.map((photo) =>
            utapi.deleteFiles(photo.key)
        )

        await Promise.all(deletePromises)

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${ebayPhotos.length} eBay photos`,
            deletedFiles: ebayPhotos.map((photo) => ({
                key: photo.key,
                name: photo.name,
                status: photo.status,
            })),
        })
    } catch (error: any) {
        console.error('Error cleaning up eBay photos:', error)
        return NextResponse.json(
            {
                error: 'Failed to cleanup eBay photos',
                details: error.message,
            },
            { status: 500 }
        )
    }
}
