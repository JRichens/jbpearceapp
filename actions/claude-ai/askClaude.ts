'use server'

import { writeFile } from 'fs/promises'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function askClaude(
    content: string,
    vehicleSearchTerm: string,
    totalItems: string
): Promise<string> {
    if (!content || !vehicleSearchTerm || !totalItems) {
        return 'Error: Missing required parameters'
    }

    try {
        // Save content to a text file
        if (false) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const filename = `api_input_${timestamp}.txt`
            const filePath = path.join(process.cwd(), 'logs', filename)

            await writeFile(filePath, content, 'utf8')
            console.log(`Content saved to ${filePath}`)
        }

        try {
            const contentStringify = JSON.stringify(content)

            const response = await anthropic.messages.create({
                model: 'claude-3-7-sonnet-20250219',
                max_tokens: 64000,
                system: `
        You have expertise in analyzing eBay vehicle parts sold listings in a javascript object format. You will present the information back as a JSON object after analyzing the data and grouping similar items.

You will be given ${totalItems} items sold on eBay in an array of objects in the following example format: '{"title":"CAR BRAND MODEL YEAR + PART DESCRIPTION","soldPrice":"£0.00","soldDate":"19 May 2024"}', ensure you analyse all of them and group similar categorised items from this list.

Analyse this data as follows:

1. Group similar items together using these techniques:
   - Consider grouping like some of these popular and typical groups that are common (but not restricted to): 'Headlight, Wing Mirror, Bonnet, Tailgate Bootlid, Front Bumper, Rear Bumper, Front Door, Rear Door, Engine, Gearbox, Turbo Charger, Alloy Wheels Set, Alloy Wheel x1, BCM, Fuse Box, Tail Brake Light, Wing Panel, Parcel Shelf, ECU, ECU Kit, ABS Pump, Steering Wheel, Alternator, Stereo / Navigation Head Unit, 
   - Apply stemming/lemmatization to match word variations
   - Consider synonyms for common car parts (e.g., "bonnet"/"hood", "wing"/"fender")
   - Keep functionally distinct parts separate (front/rear doors, headlights/fog lights, etc.)
   - Group same parts with different left / right / passenger / driver side together
   - Group same parts with different colors together
   - Handle missing or malformed price data by excluding from price calculations but including in counts

2. Create an object with the format: 
   {
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
   - Calculate the average price range using the 15th and 85th percentiles to exclude outliers, rounded to the nearest £5.
   - If an item has insufficient price data, mark avg_price as "Insufficient data"
   - Include up to 35 item objects, sorted by count in descending order.
   - Standardize part names using the most commonly appearing terminology in the dataset.

   ## Imporant Notes: Our life depends on you accurately grouping and analyzing the data effectively and efficiently and not missing out any items from the large data set in the counts for each group.

Do not include explanations about the process. Provide only the object in JSON format as your final output.
        `,
                messages: [{ role: 'user', content: contentStringify }],
            })

            // Log the full response structure for debugging
            console.log('Claude API Response Structure:', {
                id: response.id,
                model: response.model,
                contentTypes: response.content.map((c) => c.type),
                stopReason: response.stop_reason,
                usage: response.usage,
            })

            // Extract text content from the response
            let textContent = ''

            // Look for text content in the response
            for (const contentBlock of response.content) {
                if (contentBlock.type === 'text') {
                    textContent += contentBlock.text
                }
            }

            // Check if we have text content
            if (textContent) {
                // Check if the response was truncated
                if (response.stop_reason === 'max_tokens') {
                    console.log(
                        'Response was truncated due to max_tokens limit'
                    )

                    // Try to fix truncated JSON
                    try {
                        // Attempt to complete the JSON if it's truncated
                        if (
                            textContent.includes('{') &&
                            !textContent.trim().endsWith('}')
                        ) {
                            textContent += '"}]}' // Add minimal closing for items array
                        }

                        // Validate if it's parseable JSON
                        JSON.parse(textContent)
                    } catch (jsonError) {
                        console.error(
                            'Could not fix truncated JSON:',
                            jsonError
                        )
                        // If we can't fix it, we'll still return what we have
                    }
                }

                return textContent
            } else {
                console.error('No text content found in response:', response)
                return 'Sorry, there was an error processing your request. No text content found.'
            }
        } catch (apiError) {
            console.error('API call error:', apiError)
            if (apiError instanceof Error) {
                console.error('Error message:', apiError.message)
                console.error('Error stack:', apiError.stack)
            }
            return 'Sorry, there was an error calling the AI service.'
        }
    } catch (error) {
        console.error('Error in askClaude function:', error)
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        return 'Sorry, there was an error processing your request.'
    }
}
