import { getElementText } from './utils'

// Helper function to implement retry logic
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, options)

            // If it's not a server error (5xx), return immediately
            if (
                !response.ok &&
                response.status >= 500 &&
                response.status < 600 &&
                attempt < retries - 1
            ) {
                console.log(
                    `Retry ${attempt + 1}/${retries}: Server error ${
                        response.status
                    }, retrying...`
                )
                await new Promise((resolve) =>
                    setTimeout(resolve, delay * (attempt + 1))
                )
                continue
            }

            return response
        } catch (error) {
            console.error(`Fetch attempt ${attempt + 1} failed:`, error)
            lastError = error as Error

            if (attempt < retries - 1) {
                await new Promise((resolve) =>
                    setTimeout(resolve, delay * (attempt + 1))
                )
            }
        }
    }

    throw lastError || new Error('All fetch attempts failed')
}

/**
 * Get suggested categories using eBay's GetSuggestedCategories API
 * This is more efficient than searching for similar listings
 */
async function getSuggestedCategories(
    searchTerm: string
): Promise<
    Array<{ id: string; name: string; fullPath: string; finalName: string }>
> {
    try {
        console.log(`Getting suggested categories for "${searchTerm}"`)

        // Strip out ampersands from search term before using in XML
        const sanitizedSearchTerm = searchTerm.replace(/&/g, '')

        // Use eBay's Trading API to get suggested categories
        const response = await fetchWithRetry(
            'https://api.ebay.com/ws/api.dll',
            {
                method: 'POST',
                headers: {
                    'X-EBAY-API-SITEID': '3', // UK site ID
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetSuggestedCategories',
                    'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                    'Content-Type': 'text/xml',
                },
                body: `<?xml version="1.0" encoding="utf-8"?>
                <GetSuggestedCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                    </RequesterCredentials>
                    <Query>${sanitizedSearchTerm}</Query>
                </GetSuggestedCategoriesRequest>`,
            }
        )

        const responseText = await response.text()

        // Log the first part of the response for debugging
        console.log(
            'GetSuggestedCategories response (first 500 chars):',
            responseText.substring(0, 500) +
                (responseText.length > 500 ? '...' : '')
        )

        if (!response.ok) {
            console.error(
                `eBay GetSuggestedCategories API error: ${response.status} ${response.statusText}`
            )
            throw new Error(
                `eBay GetSuggestedCategories API error: ${response.statusText}`
            )
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        // Check for eBay API errors in the response
        const errorNodes = xmlDoc.getElementsByTagName('Errors')
        if (errorNodes && errorNodes.length > 0) {
            const errorMessage =
                getElementText(errorNodes[0], 'ShortMessage') ||
                getElementText(errorNodes[0], 'LongMessage') ||
                'Unknown error'
            console.error('eBay API returned an error:', errorMessage)
            throw new Error(
                `eBay GetSuggestedCategories API error: ${errorMessage}`
            )
        }

        // Get the suggested categories from the response
        const suggestedCategoryArray = xmlDoc.getElementsByTagName(
            'SuggestedCategoryArray'
        )[0]

        if (!suggestedCategoryArray) {
            console.log('No SuggestedCategoryArray found in response')
            return getDirectCategoryMatches(sanitizedSearchTerm)
        }

        const suggestedCategoryNodes =
            suggestedCategoryArray.getElementsByTagName('SuggestedCategory')
        console.log(
            `Found ${suggestedCategoryNodes.length} suggested categories`
        )

        if (suggestedCategoryNodes.length === 0) {
            console.log(
                'No suggested categories found, falling back to direct search'
            )
            return getDirectCategoryMatches(sanitizedSearchTerm)
        }

        const categories = []

        // Process each suggested category
        for (let i = 0; i < suggestedCategoryNodes.length; i++) {
            const suggestedCategory = suggestedCategoryNodes[i]
            const category =
                suggestedCategory.getElementsByTagName('Category')[0]

            if (!category) {
                console.log('No Category element found in SuggestedCategory')
                continue
            }

            const id = getElementText(category, 'CategoryID')
            const name = getElementText(category, 'CategoryName')

            if (!id || !name) {
                console.log('Missing CategoryID or CategoryName')
                continue
            }

            console.log(`Found category: ${id} - ${name}`)

            // Get parent IDs to build the category path
            const parentIds = []
            const parentIdNodes =
                category.getElementsByTagName('CategoryParentID')
            for (let j = 0; j < parentIdNodes.length; j++) {
                if (parentIdNodes[j].textContent) {
                    parentIds.push(parentIdNodes[j].textContent)
                }
            }

            // Get the confidence score (percentage) - not always provided in the response
            // so we'll just use the order they appear in the response as an indicator of relevance
            const percentageNode = suggestedCategory.getElementsByTagName(
                'SuggestedCategoryPercentage'
            )[0]

            // Default to a percentage based on position (first = 100%, second = 90%, etc.)
            const percentage =
                percentageNode && percentageNode.textContent
                    ? parseInt(percentageNode.textContent, 10)
                    : Math.max(100 - i * 10, 10) // Decreasing confidence based on position

            console.log(`Category ${id} (${name}) - Confidence: ${percentage}%`)

            // Include all categories, with a confidence score
            const nameWithPercentage = `${name} (${percentage}%)`

            categories.push({
                id,
                name: name, // Use just the name for display
                fullPath: name, // We don't have full path info in the response
                finalName: nameWithPercentage,
            })
        }

        console.log(`Processed ${categories.length} categories`)

        // Return top 3 categories (they're already in order of relevance from the API)
        return categories.slice(0, 3)
    } catch (error) {
        console.error('Error getting suggested categories:', error)

        // Fall back to direct category search
        console.log('Falling back to direct category search due to error')
        const sanitizedSearchTerm = searchTerm.replace(/&/g, '')
        return getDirectCategoryMatches(sanitizedSearchTerm)
    }
}

// Helper function to directly search for categories matching a term
async function getDirectCategoryMatches(
    searchTerm: string
): Promise<
    Array<{ id: string; name: string; fullPath: string; finalName: string }>
> {
    try {
        console.log(
            `Directly searching for categories matching "${searchTerm}"`
        )
        console.log('Search term words:', searchTerm.split(/\s+/))

        const response = await fetchWithRetry(
            'https://api.ebay.com/ws/api.dll',
            {
                method: 'POST',
                headers: {
                    'X-EBAY-API-SITEID': '3',
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetCategories',
                    'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                    'Content-Type': 'text/xml',
                },
                body: `<?xml version="1.0" encoding="utf-8"?>
                <GetCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                    </RequesterCredentials>
                    <DetailLevel>ReturnAll</DetailLevel>
                    <ViewAllNodes>true</ViewAllNodes>
                    <LevelLimit>4</LevelLimit>
                </GetCategoriesRequest>`,
            }
        )

        const responseText = await response.text()
        if (!response.ok) {
            throw new Error(`eBay API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        const categoryNodes = xmlDoc.getElementsByTagName('Category')
        const categories = []

        // Convert search term to lowercase for case-insensitive matching
        const lowerSearchTerm = searchTerm.toLowerCase()
        const searchWords = lowerSearchTerm
            .split(/\s+/)
            .filter((word) => word.length > 2)

        console.log(
            `Searching through ${categoryNodes.length} categories for matches`
        )
        console.log(`Search words:`, searchWords)

        // First pass: look for categories that match ALL search words
        const fullMatches = []
        for (let i = 0; i < categoryNodes.length; i++) {
            const category = categoryNodes[i]
            const id = getElementText(category, 'CategoryID')
            const name = getElementText(category, 'CategoryName')
            const lowerName = name.toLowerCase()

            if (id && name) {
                // Check if ALL search words are in the category name
                const allWordsMatch = searchWords.every((word) =>
                    lowerName.includes(word)
                )
                if (allWordsMatch) {
                    fullMatches.push({
                        id,
                        name,
                        fullPath: name,
                        finalName: name,
                        score: searchWords.length * 10, // Higher score for matching all words
                    })
                }
            }
        }

        console.log(
            `Found ${fullMatches.length} categories matching ALL search words`
        )

        // If we have full matches, return them
        if (fullMatches.length > 0) {
            return fullMatches.slice(0, 3)
        }

        // Second pass: score categories by how many search words they match
        const scoredMatches = []
        for (let i = 0; i < categoryNodes.length; i++) {
            const category = categoryNodes[i]
            const id = getElementText(category, 'CategoryID')
            const name = getElementText(category, 'CategoryName')
            const lowerName = name.toLowerCase()

            if (id && name) {
                // Count how many search words match
                let matchCount = 0
                for (const word of searchWords) {
                    if (lowerName.includes(word)) {
                        matchCount++
                    }
                }

                if (matchCount > 0) {
                    scoredMatches.push({
                        id,
                        name,
                        fullPath: name,
                        finalName: name,
                        score: matchCount,
                    })
                }
            }
        }

        console.log(
            `Found ${scoredMatches.length} categories matching SOME search words`
        )

        // Sort by score (descending) and return top 3
        return scoredMatches
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ id, name, fullPath, finalName }) => ({
                id,
                name,
                fullPath,
                finalName,
            }))
    } catch (error) {
        console.error('Error in direct category search:', error)
        return []
    }
}

export async function getEbayCategories(
    searchTerm?: string,
    useVehicleSearch: boolean = false
): Promise<
    Array<{ id: string; name: string; fullPath: string; finalName: string }>
> {
    if (!searchTerm) {
        return []
    }

    try {
        // When useVehicleSearch is true, use the GetSuggestedCategories API
        if (useVehicleSearch) {
            console.log('Getting suggested categories for term:', searchTerm)
            try {
                const suggestedCategories = await getSuggestedCategories(
                    searchTerm
                )
                console.log(
                    'Found suggested categories:',
                    suggestedCategories.length
                )
                return suggestedCategories
            } catch (error) {
                console.error('Error getting suggested categories:', error)

                // Fall back to direct category search if suggested categories fails
                console.log(
                    'Falling back to direct category search due to error'
                )
                const sanitizedSearchTerm = searchTerm.replace(/&/g, '')
                const directCategories = await getDirectCategoryMatches(
                    sanitizedSearchTerm
                )

                if (directCategories.length > 0) {
                    console.log(
                        'Found categories from direct search:',
                        directCategories.length
                    )
                    return directCategories
                }

                // If both methods fail, throw the original error
                throw error
            }
        }

        // Strip out ampersands from search term before using in XML for fallback search
        const sanitizedSearchTerm = searchTerm.replace(/&/g, '')

        // Fallback to original category search if useVehicleSearch is false
        console.log('Using fallback category search')
        const response = await fetchWithRetry(
            'https://api.ebay.com/ws/api.dll',
            {
                method: 'POST',
                headers: {
                    'X-EBAY-API-SITEID': '3',
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetCategories',
                    'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                    'Content-Type': 'text/xml',
                },
                body: `<?xml version="1.0" encoding="utf-8"?>
                <GetCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                    </RequesterCredentials>
                    <DetailLevel>ReturnAll</DetailLevel>
                    <ViewAllNodes>true</ViewAllNodes>
                    <LevelLimit>4</LevelLimit>
                </GetCategoriesRequest>`,
            }
        )

        const responseText = await response.text()
        if (!response.ok) {
            throw new Error(`eBay API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        const categoryNodes = xmlDoc.getElementsByTagName('Category')
        const categories = []

        for (let i = 0; i < categoryNodes.length; i++) {
            const category = categoryNodes[i]
            const id = getElementText(category, 'CategoryID')
            const name = getElementText(category, 'CategoryName')

            if (
                id &&
                name &&
                name.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
            ) {
                categories.push({
                    id,
                    name,
                    fullPath: name,
                    finalName: name,
                })
            }
        }

        return categories.slice(0, 10)
    } catch (error) {
        console.error('Error in getEbayCategories:', error)
        throw error
    }
}
