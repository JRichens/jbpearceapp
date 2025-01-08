import { NextResponse } from 'next/server'
import { UTApi } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

const utapi = new UTApi()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const photo = formData.get('photos') as File

        if (!photo) {
            return NextResponse.json(
                { error: 'No photo provided' },
                { status: 400 }
            )
        }

        // Upload directly using uploadthing
        const uploadResponse = await utapi.uploadFiles(photo)

        if (!uploadResponse?.data?.url) {
            throw new Error('Failed to upload photo')
        }

        return NextResponse.json({
            success: true,
            url: uploadResponse.data.url,
        })
    } catch (error) {
        console.error('Error uploading photo:', error)
        return NextResponse.json(
            {
                error: 'Failed to upload photo',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
