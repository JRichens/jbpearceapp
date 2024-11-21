import { XMLParser } from 'fast-xml-parser'
import { ShippingProfile } from './types'

export async function getShippingProfiles(): Promise<ShippingProfile[]> {
    try {
        const token = process.env.EBAY_USER_TOKEN
        if (!token) {
            throw new Error('EBAY_USER_TOKEN is not configured')
        }

        // First get active listings
        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3', // UK site ID
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetMyeBaySelling',
                'X-EBAY-API-IAF-TOKEN': `${token}`,
                'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
                <GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${token}</eBayAuthToken>
                    </RequesterCredentials>
                    <ActiveList>
                        <Include>true</Include>
                        <Pagination>
                            <EntriesPerPage>1</EntriesPerPage>
                            <PageNumber>1</PageNumber>
                        </Pagination>
                    </ActiveList>
                    <DetailLevel>ReturnAll</DetailLevel>
                </GetMyeBaySellingRequest>`,
        })

        const responseText = await response.text()

        if (!response.ok) {
            throw new Error(
                `eBay API error: ${response.status} ${response.statusText}. Response: ${responseText}`
            )
        }

        const parser = new XMLParser({
            ignoreAttributes: false,
            parseAttributeValue: true,
            trimValues: true,
            ignoreDeclaration: true,
        })

        const result = parser.parse(responseText)

        // Check for eBay API errors in the response
        if (result.GetMyeBaySellingResponse?.Ack === 'Failure') {
            const errors = result.GetMyeBaySellingResponse.Errors
            const errorMessage = Array.isArray(errors)
                ? errors
                      .map((e) => `${e.SeverityCode}: ${e.LongMessage}`)
                      .join(', ')
                : errors?.LongMessage || 'Unknown eBay API error'
            throw new Error(`eBay API returned an error: ${errorMessage}`)
        }

        // Get the first active item's ID
        const firstItem =
            result.GetMyeBaySellingResponse?.ActiveList?.ItemArray?.Item?.[0]
        if (!firstItem?.ItemID) {
            throw new Error('No active listings found')
        }

        // Now get the detailed item info to extract shipping profile
        const itemResponse = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetItem',
                'X-EBAY-API-IAF-TOKEN': `${token}`,
                'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
                <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${token}</eBayAuthToken>
                    </RequesterCredentials>
                    <ItemID>${firstItem.ItemID}</ItemID>
                    <DetailLevel>ReturnAll</DetailLevel>
                </GetItemRequest>`,
        })

        const itemResponseText = await itemResponse.text()

        if (!itemResponse.ok) {
            throw new Error(
                `eBay API error: ${itemResponse.status} ${itemResponse.statusText}. Response: ${itemResponseText}`
            )
        }

        const itemResult = parser.parse(itemResponseText)

        // Check for eBay API errors in the item response
        if (itemResult.GetItemResponse?.Ack === 'Failure') {
            const errors = itemResult.GetItemResponse.Errors
            const errorMessage = Array.isArray(errors)
                ? errors
                      .map((e) => `${e.SeverityCode}: ${e.LongMessage}`)
                      .join(', ')
                : errors?.LongMessage || 'Unknown eBay API error'
            throw new Error(`eBay API returned an error: ${errorMessage}`)
        }

        // Extract shipping profile from the item
        const sellerProfiles = itemResult.GetItemResponse?.Item?.SellerProfiles
        if (!sellerProfiles?.SellerShippingProfile) {
            throw new Error('No shipping profile found in the active listing')
        }

        const shippingProfile = sellerProfiles.SellerShippingProfile
        const mappedProfiles = [
            {
                profileId: shippingProfile.ShippingProfileID,
                profileName: shippingProfile.ShippingProfileName,
                description: `Shipping Profile ID: ${shippingProfile.ShippingProfileID}`,
                isDefault: true,
                categoryGroups: [],
            },
        ]

        return mappedProfiles
    } catch (error) {
        console.error('Error in getShippingProfiles:', error)
        throw error instanceof Error
            ? error
            : new Error(
                  'Unknown error occurred while fetching shipping profiles'
              )
    }
}
