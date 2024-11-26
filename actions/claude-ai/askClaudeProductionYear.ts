'use server'

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

type ProductionYearResponse = {
    from: string
    to: string
    facelift: string
    description: string
}

export async function askClaudeProductionYear(
    vehicle: string,
    part: string
): Promise<ProductionYearResponse | string> {
    if (!vehicle || !part) {
        return 'Error: Missing required vehicle or part information'
    }

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
            temperature: 0,
            system: `You have a vast understanding of car manufacturing dates and can advise which years a particular make and model and year of car's manufacturing date spans from and to with the additional information of if the car had a facelift or update. This information is crucial and will be used on second hand car parts ebay listings to inform customers if they part is likely similar to their production year.

Initial task: Give information on the manufacturing date span of the vehicle provided. We need to know the date this specific make and model of vehicle started being manufactured, the date it ended manufacturing and a date if there was a facelift or life cycle impulse.

Secondary task: Look at the part and advise if that part will fit on the manufacturing span of vehicle, particularly if there is a facelift or lci. Include this advise in the description.

How to provide a response: You must provide the response strictly as a JSON only with 4 properties, "from", "to", "facelift", "description". The 'from' property must have just the year of the beginning of the vehicle's manufacturing date, such as just "2008". The 'to' property must have just the year of the end manufacturing date, such as just "2014". The 'facelift' property must have just the year of the facelift or life cycle impulse, such as just "2010". The 'description' property must contain a concise write-up explaining the production date spans and any facelifts or changes that may have occurred along with if the part should be compatible within those years.`,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `The vehicle provided is ${vehicle}.
                            The part provided is a ${part}`,
                        },
                    ],
                },
            ],
        })

        if ('text' in response.content[0]) {
            try {
                const parsedResponse = JSON.parse(
                    response.content[0].text
                ) as ProductionYearResponse
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
