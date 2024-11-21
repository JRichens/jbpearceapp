import { getElementText } from './utils'

async function findSimilarListingsCategories(
    searchTerm: string
): Promise<
    Array<{ id: string; name: string; fullPath: string; finalName: string }>
> {
    try {
        // Search for similar listings using Finding API with simplified search term
        const response = await fetch(
            'https://svcs.ebay.com/services/search/FindingService/v1',
            {
                method: 'POST',
                headers: {
                    'X-EBAY-SOA-SECURITY-APPNAME': `${process.env.EBAY_APP_ID}`,
                    'X-EBAY-SOA-OPERATION-NAME': 'findItemsByKeywords',
                    'X-EBAY-SOA-SERVICE-VERSION': '1.13.0',
                    'X-EBAY-SOA-GLOBAL-ID': 'EBAY-GB',
                    'Content-Type': 'text/xml',
                },
                body: `<?xml version="1.0" encoding="utf-8"?>
                <findItemsByKeywordsRequest xmlns="http://www.ebay.com/marketplace/search/v1/services">
                    <keywords>${searchTerm}</keywords>
                    <itemFilter>
                        <name>Condition</name>
                        <value>Used</value>
                    </itemFilter>
                    <paginationInput>
                        <entriesPerPage>100</entriesPerPage>
                        <pageNumber>1</pageNumber>
                    </paginationInput>
                    <outputSelector>Category</outputSelector>
                </findItemsByKeywordsRequest>`,
            }
        )

        const responseText = await response.text()
        if (!response.ok) {
            throw new Error(`eBay Finding API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        // Count frequency of each category
        const categoryFrequency = new Map<string, number>()
        const categoryDetails = new Map<string, { name: string }>()

        const items = xmlDoc.getElementsByTagName('item')
        const totalItems = items.length
        console.log(`Found ${totalItems} similar listings for "${searchTerm}"`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const categoryId = getElementText(item, 'categoryId')
            const categoryName = getElementText(item, 'categoryName')

            if (categoryId && categoryName) {
                categoryFrequency.set(
                    categoryId,
                    (categoryFrequency.get(categoryId) || 0) + 1
                )
                categoryDetails.set(categoryId, { name: categoryName })
            }
        }

        // Sort categories by frequency and take top 3
        const sortedCategories = Array.from(categoryFrequency.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
            .slice(0, 3) // Take top 3

        console.log(`Found ${sortedCategories.length} most common categories`)
        sortedCategories.forEach(([id, frequency]) => {
            const percentage = Math.round((frequency / totalItems) * 100)
            console.log(
                `Category ${id} (${
                    categoryDetails.get(id)?.name
                }) used ${frequency} times (${percentage}%)`
            )
        })

        if (sortedCategories.length === 0) {
            return []
        }

        // Create initial result with basic information
        const initialResult = sortedCategories.map(([id, frequency]) => {
            const percentage = Math.round((frequency / totalItems) * 100)
            const categoryName = categoryDetails.get(id)?.name || id
            const nameWithPercentage = `${categoryName} (${percentage}%)`
            return {
                id,
                name: nameWithPercentage,
                fullPath: nameWithPercentage,
                finalName: nameWithPercentage,
            }
        })

        // Get full category details for the top categories
        const topCategoryIds = sortedCategories.map(([id]) => id)

        try {
            const categoriesResponse = await fetch(
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
                            <eBayAuthToken>${
                                process.env.EBAY_USER_TOKEN
                            }</eBayAuthToken>
                        </RequesterCredentials>
                        <CategoryID>${topCategoryIds.join(',')}</CategoryID>
                        <DetailLevel>ReturnAll</DetailLevel>
                    </GetCategoriesRequest>`,
                }
            )

            const categoriesText = await categoriesResponse.text()
            if (!categoriesResponse.ok) {
                console.error(
                    `eBay Categories API error: ${categoriesResponse.statusText}`
                )
                return initialResult
            }

            const categoriesXml = parser.parseFromString(
                categoriesText,
                'text/xml'
            )
            const categoryNodes = categoriesXml.getElementsByTagName('Category')
            const categories = new Map()

            // First pass: store all categories
            for (let i = 0; i < categoryNodes.length; i++) {
                const category = categoryNodes[i]
                const id = getElementText(category, 'CategoryID')
                const name = getElementText(category, 'CategoryName')
                const parentId = getElementText(category, 'CategoryParentID')

                if (id && name) {
                    categories.set(id, { id, name, parentId })
                }
            }

            // Build full paths for categories
            function buildCategoryPath(categoryId: string): string {
                const parts = new Set<string>() // Use Set to prevent duplicates
                let currentId = categoryId
                let depth = 0
                const MAX_DEPTH = 10

                while (
                    currentId &&
                    categories.has(currentId) &&
                    depth < MAX_DEPTH
                ) {
                    const category = categories.get(currentId)
                    parts.add(category.name)
                    currentId = category.parentId
                    depth++
                }

                // Convert Set back to Array and reverse to get correct order
                return Array.from(parts).reverse().join(' > ')
            }

            // Update result with full paths
            return sortedCategories.map(([id, frequency]) => {
                const percentage = Math.round((frequency / totalItems) * 100)
                const categoryName = categoryDetails.get(id)?.name || id
                const nameWithPercentage = `${categoryName} (${percentage}%)`
                const fullPath = categories.has(id)
                    ? buildCategoryPath(id)
                    : nameWithPercentage

                return {
                    id,
                    name: fullPath,
                    fullPath,
                    finalName: nameWithPercentage,
                }
            })
        } catch (error) {
            console.error('Error fetching full category paths:', error)
            return initialResult
        }
    } catch (error) {
        console.error('Error finding similar listings categories:', error)
        throw error
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
        // Always use findSimilarListingsCategories when useVehicleSearch is true
        if (useVehicleSearch) {
            console.log(
                'Searching similar listings for categories with term:',
                searchTerm
            )
            const similarCategories = await findSimilarListingsCategories(
                searchTerm
            )
            console.log(
                'Found categories from similar listings:',
                similarCategories.length
            )
            return similarCategories
        }

        // Fallback to original category search if useVehicleSearch is false
        console.log('Using fallback category search')
        const response = await fetch('https://api.ebay.com/ws/api.dll', {
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
        })

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
                name.toLowerCase().includes(searchTerm.toLowerCase())
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
