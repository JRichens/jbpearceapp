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
            await client.messages
                .stream({
                    model: 'claude-3-5-sonnet-20240620',
                    max_tokens: 4000,
                    system: `
        You are an AI assistant with expertise in analyzing eBay vehicle parts sold listings in a javascript object and presenting the information as an object in JSON.

You will be give ${totalItems} items sold on eBay, ensure you analyse all of them.

Analyse this data as follows:

1. Recognize which items have sold the most.

2. Create an object with the format: 
   {
     "date_span": "Date Span",
     "items": [
       {
         "item": "Item Name",
         "avg_price": "Average Price Range",
         "frequency": "Frequency",
         "count": "Count"
       }
     ]
   }

   Follow these guidelines:
   - Each object in the array represents an item with properties like title, soldPrice, and soldDate. Count all of these individual items.
   - Determine frequency categories dynamically based on the data distribution:
     * Calculate the median count of all items.
     * Very High: > 2 * median
     * High: > 1.5 * median and <= 2 * median
     * Medium: > 0.5 * median and <= 1.5 * median
     * Low: <= 0.5 * median
   - Calculate the average price range using the 15th and 85th percentiles, rounded to the nearest £5.
   - Include up to 25 item objects, sorted by count in descending order.
   - Combine similar items under a single name (e.g., "Tail Lights" for both "Rear Tail Lights" and "Tail Lights").

3. Find the earliest and latest date span to understand the date range of sales. Use the format "DD MMM YYYY - DD MMM YYYY" from oldest date to latest date.

Do not include explanations about the process. Provide only the object in JSON format as your final output.
        `,
                    messages: [
                        {
                            role: 'user',
                            content: JSON.stringify(content),
                        },
                    ],
                })
                .on('text', (text) => {
                    controller.enqueue(new TextEncoder().encode(text))
                })
                .on('end', () => {
                    controller.close()
                })
                .on('error', (err) => {
                    controller.error(err)
                })
        },
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
        },
    })
}
