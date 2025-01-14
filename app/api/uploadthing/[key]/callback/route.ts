import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { key: string } }
) {
    const timestamp = new Date().toISOString()
    console.log('[UploadThing] Callback received:', {
        key: params.key,
        timestamp,
    })

    try {
        // Verify the file exists
        const response = await fetch(`https://utfs.io/f/${params.key}`, {
            method: 'HEAD',
        })

        if (!response.ok) {
            console.error('[UploadThing] Callback verification failed:', {
                key: params.key,
                status: response.status,
                timestamp,
            })
            return NextResponse.json(
                { error: 'File verification failed' },
                { status: 400 }
            )
        }

        console.log('[UploadThing] Callback verification succeeded:', {
            key: params.key,
            timestamp,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[UploadThing] Callback error:', {
            key: params.key,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp,
        })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
