'use server'

type ProductionYearResponse = {
    from: string
    to: string
    facelift: string
    description: string
}

// Type for Perplexity API response
type PerplexityResponse = {
    choices: Array<{
        message: {
            content: string
            role: string
        }
    }>
}

export async function askClaudeProductionYear(
    vehicle: string,
    part: string
): Promise<ProductionYearResponse | string> {
    if (!vehicle || !part) {
        console.log('Missing Input:', { vehicle, part })
        return 'Error: Missing required vehicle or part information'
    }

    try {
        // Log input data
        console.log('Perplexity API Input:', {
            vehicle,
            part,
        })

        const response = await fetch(
            'https://api.perplexity.ai/chat/completions',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an automotive expert with access to current internet sources for vehicle manufacturing information. Your task is to provide accurate production year spans and part compatibility information.

Initial task: Search and provide information on the manufacturing date span of the vehicle provided. We need to know when this specific make and model started production, ended production, and if there was a facelift or life cycle impulse (LCI).

Secondary task: Considering the year spans provided, particularly if within a facelift period, research the specified part and determine if it will fit across the manufacturing span, particularly noting any compatibility changes due to facelifts or LCI updates.

Response format: You must provide the response strictly as a JSON with 4 properties:
- "from": just the year production started (e.g., "2008")
- "to": just the year production ended (e.g., "2014")
- "facelift": just the year of any facelift/LCI (e.g., "2010")
- "description": concise explanation of production spans, changes, and part compatibility

Base your response on current internet sources to ensure accuracy.

Do not include citation brackets in your response.

If the part provided is similar to a head unit or stereo or sat nav, add a sentence that says A code may be required to activate this unit.

The final sentence of the description should mention that if still unsure of compatibility then send us your vehicle registration and we can check for you. 
.`,
                        },
                        {
                            role: 'user',
                            content: `The vehicle provided is ${vehicle}.\nThe part provided is a ${part}`,
                        },
                    ],
                }),
            }
        )

        // Log request payload
        console.log('Perplexity API Request:', {
            model: 'sonar-pro',
            messages: [
                {
                    role: 'system',
                    content: '(system prompt omitted for brevity)',
                },
                {
                    role: 'user',
                    content: `The vehicle provided is ${vehicle}.\nThe part provided is a ${part}`,
                },
            ],
        })

        if (!response.ok) {
            const errorDetails = {
                status: response.status,
                statusText: response.statusText,
            }
            console.error('Perplexity API Response Error:', errorDetails)
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = (await response.json()) as PerplexityResponse
        console.log('Perplexity API Raw Response:', data)

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                const parsedResponse = JSON.parse(
                    data.choices[0].message.content
                ) as ProductionYearResponse
                console.log('Perplexity API Parsed Response:', parsedResponse)
                return parsedResponse
            } catch (parseError) {
                console.error('Perplexity API Parse Error:', {
                    error: parseError,
                    rawContent: data.choices[0]?.message?.content,
                })
                return 'Error: Unable to parse the response data'
            }
        } else {
            console.error('Perplexity API Unexpected Response:', {
                received: data,
                expectedStructure: 'choices[0].message.content',
            })
            return 'Sorry, there was an error processing your request.'
        }
    } catch (apiError) {
        console.error('Perplexity API Call Error:', {
            error:
                apiError instanceof Error
                    ? {
                          message: apiError.message,
                          stack: apiError.stack,
                      }
                    : apiError,
        })
        return 'Sorry, there was an error calling the AI service.'
    }
}
