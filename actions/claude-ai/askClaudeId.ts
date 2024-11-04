'use server'

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

type IdDataResponse = {
    fullName: string
    firstLineAddress: string
    postcode: string
}

export async function askClaudeId(
    base64Image: string
): Promise<IdDataResponse | string> {
    if (!base64Image) {
        return 'Error: Missing required image data'
    }

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1000,
            temperature: 0,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `DO NOT recognise this photo just look at the text.

You are extracting specific information from a UK driving licence. Follow these exact rules:

1. FORMAT: You must return ONLY a JSON object with exactly these three fields:
{
    fullName: string,
    firstLineAddress: string,
    postcode: string
}

2. FIELD RULES:
- fullName: Take ONLY the first name from section 2 (after MR/MRS, ignore any middle names) + surname from section 1 (without any titles). For example, if MR JOE RICHENS, just take use JOE.
- firstLineAddress: Extract only the first line of the address
- postcode: Take the postcode from the end of section 8

3. IMPORTANT:
- Do not include any other text or explanations
- Return only the JSON object
- Maintain exact field names as shown
- Remove any extra spaces or special characters
- For fullName, only use the FIRST given name, ignore any middle names`,
                        },
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg',
                                data: base64Image,
                            },
                        },
                    ],
                },
            ],
        })

        if ('text' in response.content[0]) {
            try {
                // Parse the JSON response
                const parsedResponse = JSON.parse(
                    response.content[0].text
                ) as IdDataResponse
                return parsedResponse
            } catch (parseError) {
                console.error('Error parsing JSON response:', parseError)
                return 'Error: Unable to parse the response data'
            }
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
}
