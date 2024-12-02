export async function getCategoryFeatures(categoryId: string): Promise<{
    bestOfferAutoAcceptEnabled: boolean
    bestOfferAutoDeclineEnabled: boolean
}> {
    try {
        const requestXml = `<?xml version="1.0" encoding="utf-8"?>
            <GetCategoryFeaturesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                </RequesterCredentials>
                <CategoryID>${categoryId}</CategoryID>
                <DetailLevel>ReturnAll</DetailLevel>
                <FeatureID>BestOfferAutoAcceptEnabled</FeatureID>
                <FeatureID>BestOfferAutoDeclineEnabled</FeatureID>
                <ViewAllNodes>true</ViewAllNodes>
            </GetCategoryFeaturesRequest>`

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3', // UK Site ID
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetCategoryFeatures',
                'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                'Content-Type': 'text/xml',
            },
            body: requestXml,
        })

        const responseText = await response.text()

        if (!response.ok) {
            throw new Error(`eBay API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        const category = xmlDoc.getElementsByTagName('Category')[0]
        if (!category) {
            throw new Error('Category features not found')
        }

        const bestOfferAutoAcceptEnabled =
            category.getElementsByTagName('BestOfferAutoAcceptEnabled')[0]
                ?.textContent === 'true'
        const bestOfferAutoDeclineEnabled =
            category.getElementsByTagName('BestOfferAutoDeclineEnabled')[0]
                ?.textContent === 'true'

        return {
            bestOfferAutoAcceptEnabled,
            bestOfferAutoDeclineEnabled,
        }
    } catch (error) {
        console.error('Error in getCategoryFeatures:', error)
        throw error
    }
}
