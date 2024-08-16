import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { content, vehicleSearchTerm, totalItems } = body

    if (!content || !vehicleSearchTerm) {
        return NextResponse.json(
            { error: 'Content and vehicleSearchTerm are required' },
            { status: 400 }
        )
    }

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const stream = await client.messages.stream({
                    model: 'claude-3-5-sonnet-20240620',
                    max_tokens: 4000,
                    system: `...prompt`,
                    messages: [
                        {
                            role: 'user',
                            content: JSON.stringify(content),
                        },
                    ],
                })

                for await (const chunk of stream) {
                    if (chunk.type === 'content_block_delta') {
                        if ('text' in chunk.delta) {
                            controller.enqueue(
                                new TextEncoder().encode(chunk.delta.text)
                            )
                        }
                    }
                }
            } catch (error) {
                console.error('Stream error:', error)
                controller.error(error)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
        },
    })
}
