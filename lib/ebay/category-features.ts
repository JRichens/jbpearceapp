import { DOMParser, Document } from '@xmldom/xmldom'

interface CategoryFeatureResponse {
    supportsCompatibility: boolean
    name?: string
    error?: string
}

// Known compatible categories for parts and accessories
export const COMPATIBLE_CATEGORIES = {
    // Car & Truck Parts & Accessories
    CAR_PARTS: '6030',
    // Motorcycle Parts
    MOTORCYCLE_PARTS: '10063',
    // Car & Truck Wheels, Tyres & Parts
    WHEELS_TYRES: '33743',
    // Performance & Racing Parts
    PERFORMANCE_PARTS: '107057',
} as const

// Common categories that support parts compatibility
export const COMMON_COMPATIBLE_CATEGORIES = {
    'Car & Truck Parts': '6030',
    'Motorcycle Parts': '10063',
    'Other Vehicle Parts': '179753',
    'Performance & Racing Parts': '107057',
    'Vintage Car & Truck Parts': '10063',
    'Scooter Parts': '84149',
    'ATV, Side-by-Side & UTV Parts': '43962',
    'Boat Parts': '26429',
} as const

// Helper function to check if category is in parts & accessories tree
export function isPartsCategory(categoryId: string): boolean {
    const partsMainCategories = [
        '6030', // Car & Truck Parts
        '10063', // Motorcycle Parts
        '6028', // Automotive Tools
        '33743', // Wheels & Tyres
        '179753', // Other Vehicle Parts
        '107057', // Performance & Racing Parts
        '84149', // Scooter Parts
        '43962', // ATV Parts
        '26429', // Boat Parts
    ]

    return (
        partsMainCategories.includes(categoryId) ||
        partsMainCategories.some((mainCat) => categoryId.startsWith(mainCat))
    )
}

// Helper function to get text content from XML element
const getXmlElementText = (doc: Document, tagName: string): string => {
    const elements = doc.getElementsByTagName(tagName)
    if (elements.length === 0) return ''
    const element = elements[0]
    return element.textContent || ''
}

export async function checkCategoryCompatibility(
    categoryId: string
): Promise<CategoryFeatureResponse> {
    try {
        const requestXml = `<?xml version="1.0" encoding="utf-8"?>
            <GetCategoryFeaturesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                </RequesterCredentials>
                <CategoryID>${categoryId}</CategoryID>
                <DetailLevel>ReturnAll</DetailLevel>
                <ViewAllNodes>true</ViewAllNodes>
                <FeatureID>ItemCompatibilityEnabled</FeatureID>
            </GetCategoryFeaturesRequest>`

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '1227',
                'X-EBAY-API-CALL-NAME': 'GetCategoryFeatures',
                'X-EBAY-API-IAF-TOKEN': process.env.EBAY_USER_TOKEN!,
                'Content-Type': 'text/xml',
            },
            body: requestXml,
        })

        const responseText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(
            responseText,
            'text/xml'
        ) as Document

        // First check if this is a parts category
        if (!isPartsCategory(categoryId)) {
            return {
                supportsCompatibility: false,
                name: getXmlElementText(xmlDoc, 'CategoryName'),
                error: 'Category is not in the parts & accessories tree',
            }
        }

        // Check if Parts Compatibility is enabled
        const compatibilityEnabled =
            getXmlElementText(xmlDoc, 'ItemCompatibilityEnabled') === 'true'
        const categoryName = getXmlElementText(xmlDoc, 'CategoryName')

        // If it's a parts category but compatibility isn't enabled,
        // check the parent category
        if (!compatibilityEnabled) {
            const parentCategoryId = getXmlElementText(
                xmlDoc,
                'ParentCategoryID'
            )
            if (parentCategoryId) {
                console.log(
                    `Checking parent category ${parentCategoryId} for compatibility support...`
                )
                return checkCategoryCompatibility(parentCategoryId)
            }
        }

        // If we found compatibility is enabled, or we've reached a root category
        return {
            supportsCompatibility: compatibilityEnabled,
            name: categoryName,
        }
    } catch (error) {
        console.error('Error checking category compatibility:', error)
        return {
            supportsCompatibility: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

export async function getCompatibleCategories(): Promise<
    Array<{ id: string; name: string }>
> {
    try {
        const requestXml = `<?xml version="1.0" encoding="utf-8"?>
            <GetCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                </RequesterCredentials>
                <DetailLevel>ReturnAll</DetailLevel>
                <ViewAllNodes>true</ViewAllNodes>
            </GetCategoriesRequest>`

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '1227',
                'X-EBAY-API-CALL-NAME': 'GetCategories',
                'X-EBAY-API-IAF-TOKEN': process.env.EBAY_USER_TOKEN!,
                'Content-Type': 'text/xml',
            },
            body: requestXml,
        })

        const responseText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(
            responseText,
            'text/xml'
        ) as Document

        const compatibleCategories: Array<{ id: string; name: string }> = []
        const categories = xmlDoc.getElementsByTagName('Category')

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i]
            const categoryId =
                category.getElementsByTagName('CategoryID')[0]?.textContent ||
                ''
            const categoryName =
                category.getElementsByTagName('CategoryName')[0]?.textContent ||
                ''

            if (categoryId && isPartsCategory(categoryId)) {
                const features = await checkCategoryCompatibility(categoryId)
                if (features.supportsCompatibility) {
                    compatibleCategories.push({
                        id: categoryId,
                        name: categoryName || features.name || 'Unknown',
                    })
                }
            }
        }

        return compatibleCategories
    } catch (error) {
        console.error('Error getting compatible categories:', error)
        return []
    }
}
