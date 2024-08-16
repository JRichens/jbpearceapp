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
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 4000,
                system: `
        You have expertise in analyzing eBay vehicle parts sold listings in a javascript object in this format. You can then present the information back as an object in JSON after analysing the data and grouping similar items.

You will be give ${totalItems} items sold on eBay in an array of objects in the following example format: '{"title":"CAR BRAND MODEL YEAR + PART DESCRIPTION","soldPrice":"£0.00","soldDate":"19 May 2024"}', ensure you analyse all of them and group similar categorised items from this list.

Analyse this data as follows:

1. Group similar items together using stemming or lemmatization to match word variations and also consider synonyms for common car parts and for disambiguation you should keep front door and rear door seperate and headlights and fog lights seperate for example and different colours can be grouped together.

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
   - Calculate the average price range using the 15th and 85th percentiles, rounded to the nearest £5.
   - Include up to 25 item objects, sorted by count in descending order.
   - Combine similar items under a single name (e.g., "Tail Lights" for both "Rear Tail Lights" and "Tail Lights").

Do not include explanations about the process. Provide only the object in JSON format as your final output.
        `,
                messages: [{ role: 'user', content: contentStringify }],
            })

            if ('text' in response.content[0]) {
                return response.content[0].text
            } else {
                console.error('Unexpected response structure:', response)
                return 'Sorry, there was an error processing your request.'
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
