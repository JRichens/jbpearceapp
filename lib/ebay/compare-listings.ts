import { getElementText } from './utils'

interface ListingDetails {
    [key: string]: any
}

export async function compareEbayListings(
    apiListingId: string,
    manualListingId: string
): Promise<{
    missingFields: string[]
    differentValues: { field: string; api: string; manual: string }[]
    apiListing: ListingDetails
    manualListing: ListingDetails
}> {
    try {
        // Fetch both listings using GetItem call
        const [apiListing, manualListing] = await Promise.all([
            fetchListingDetails(apiListingId),
            fetchListingDetails(manualListingId),
        ])

        // Compare the listings
        const missingFields: string[] = []
        const differentValues: {
            field: string
            api: string
            manual: string
        }[] = []

        // Helper function to recursively compare objects
        function compareObjects(manual: any, api: any, path: string = '') {
            for (const key in manual) {
                // Skip description comparison
                if (key === 'description') continue

                const currentPath = path ? `${path}.${key}` : key

                if (!(key in api)) {
                    missingFields.push(currentPath)
                    continue
                }

                if (typeof manual[key] === 'object' && manual[key] !== null) {
                    compareObjects(manual[key], api[key], currentPath)
                } else if (manual[key] !== api[key]) {
                    differentValues.push({
                        field: currentPath,
                        api: String(api[key]),
                        manual: String(manual[key]),
                    })
                }
            }
        }

        compareObjects(manualListing, apiListing)

        return {
            missingFields,
            differentValues,
            apiListing,
            manualListing,
        }
    } catch (error) {
        console.error('Error comparing eBay listings:', error)
        throw error
    }
}

async function fetchListingDetails(itemId: string): Promise<ListingDetails> {
    try {
        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetItem',
                'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
                <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                    </RequesterCredentials>
                    <ItemID>${itemId}</ItemID>
                    <DetailLevel>ReturnAll</DetailLevel>
                    <IncludeItemSpecifics>true</IncludeItemSpecifics>
                </GetItemRequest>`,
        })

        const responseText = await response.text()

        if (!response.ok) {
            throw new Error(`eBay API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        // Extract all relevant details
        const details: ListingDetails = {
            title: getElementText(xmlDoc, 'Title'),
            description: getElementText(xmlDoc, 'Description'),
            primaryCategory: {
                id: getElementText(xmlDoc, 'CategoryID'),
                name: getElementText(xmlDoc, 'CategoryName'),
            },
            condition: {
                id: getElementText(xmlDoc, 'ConditionID'),
                name: getElementText(xmlDoc, 'ConditionDisplayName'),
                description: getElementText(xmlDoc, 'ConditionDescription'), // Added this line
            },
            price: {
                value: getElementText(xmlDoc, 'CurrentPrice'),
                currency: xmlDoc
                    .getElementsByTagName('CurrentPrice')[0]
                    ?.getAttribute('currencyID'),
            },
            quantity: getElementText(xmlDoc, 'Quantity'),
            itemSpecifics: {},
        }

        // Extract Item Specifics
        const nameValueList = xmlDoc.getElementsByTagName('NameValueList')
        for (let i = 0; i < nameValueList.length; i++) {
            const name = getElementText(nameValueList[i], 'Name')
            const value = getElementText(nameValueList[i], 'Value')
            if (name && value) {
                details.itemSpecifics[name] = value
            }
        }

        // Extract shipping details
        const shippingDetails =
            xmlDoc.getElementsByTagName('ShippingDetails')[0]
        if (shippingDetails) {
            details.shipping = {
                shippingType: getElementText(shippingDetails, 'ShippingType'),
                shippingServiceOptions: [],
            }

            const shippingServices = shippingDetails.getElementsByTagName(
                'ShippingServiceOptions'
            )
            for (let i = 0; i < shippingServices.length; i++) {
                const service = shippingServices[i]
                details.shipping.shippingServiceOptions.push({
                    service: getElementText(service, 'ShippingService'),
                    cost: getElementText(service, 'ShippingServiceCost'),
                    priority: getElementText(
                        service,
                        'ShippingServicePriority'
                    ),
                })
            }
        }

        // Extract return policy
        const returnPolicy = xmlDoc.getElementsByTagName('ReturnPolicy')[0]
        if (returnPolicy) {
            details.returnPolicy = {
                returnsAccepted: getElementText(
                    returnPolicy,
                    'ReturnsAccepted'
                ),
                returnsWithin: getElementText(returnPolicy, 'ReturnsWithin'),
                refundOption: getElementText(returnPolicy, 'RefundOption'),
                shippingCostPaidBy: getElementText(
                    returnPolicy,
                    'ShippingCostPaidBy'
                ),
            }
        }

        return details
    } catch (error) {
        console.error(`Error fetching eBay listing ${itemId}:`, error)
        throw error
    }
}
