import { EbayListing } from './types'
import { getElementText, getElementNumber } from './utils'

export async function getMyEbayListings(): Promise<EbayListing[]> {
    const allListings: EbayListing[] = []
    let pageNumber = 1
    const entriesPerPage = 200

    try {
        let hasMorePages = true

        while (hasMorePages) {
            const response = await fetch('https://api.ebay.com/ws/api.dll', {
                method: 'POST',
                headers: {
                    'X-EBAY-API-SITEID': '3',
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetMyeBaySelling',
                    'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                    'Content-Type': 'text/xml',
                },
                body: `<?xml version="1.0" encoding="utf-8"?>
                    <GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                        <RequesterCredentials>
                            <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
                        </RequesterCredentials>
                        <ActiveList>
                            <Include>true</Include>
                            <DetailLevel>ReturnAll</DetailLevel>
                            <Pagination>
                                <EntriesPerPage>${entriesPerPage}</EntriesPerPage>
                                <PageNumber>${pageNumber}</PageNumber>
                            </Pagination>
                        </ActiveList>
                    </GetMyeBaySellingRequest>`,
            })

            const responseText = await response.text()

            if (!response.ok) {
                throw new Error(`eBay API error: ${response.statusText}`)
            }

            const { DOMParser } = require('@xmldom/xmldom')
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(responseText, 'text/xml')

            // Get pagination results
            const paginationResult =
                xmlDoc.getElementsByTagName('PaginationResult')[0]
            const totalPages = parseInt(
                getElementText(paginationResult, 'TotalNumberOfPages'),
                10
            )
            const totalEntries = parseInt(
                getElementText(paginationResult, 'TotalNumberOfEntries'),
                10
            )

            // Process items
            const items = xmlDoc.getElementsByTagName('Item')
            const itemsOnThisPage = items.length

            const pageListings: EbayListing[] = []

            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                const buyItNowPrice =
                    item.getElementsByTagName('BuyItNowPrice')[0]
                const listingDetails =
                    item.getElementsByTagName('ListingDetails')[0]
                const pictureDetails =
                    item.getElementsByTagName('PictureDetails')[0]
                const shippingDetails =
                    item.getElementsByTagName('ShippingDetails')[0]
                const shippingServiceOptions =
                    shippingDetails?.getElementsByTagName(
                        'ShippingServiceOptions'
                    )[0]
                const shippingServiceCost =
                    shippingServiceOptions?.getElementsByTagName(
                        'ShippingServiceCost'
                    )[0]
                const itemId = getElementText(item, 'ItemID')
                const quantity = getElementNumber(item, 'Quantity') || 1
                const quantityAvailable =
                    getElementNumber(item, 'QuantityAvailable') || 0
                const quantitySold = quantity - quantityAvailable

                pageListings.push({
                    id: itemId, // Using itemId as the id
                    itemId: itemId,
                    title: getElementText(item, 'Title'),
                    description: getElementText(item, 'Description') || '',
                    price: {
                        value: buyItNowPrice?.textContent || '0',
                        currency:
                            buyItNowPrice?.getAttribute('currencyID') || 'GBP',
                    },
                    listingStatus: getElementText(item, 'ListingType'),
                    condition: getElementText(item, 'ConditionID') || 'Used',
                    imageUrl: getElementText(pictureDetails, 'GalleryURL'),
                    imageUrls: [getElementText(pictureDetails, 'GalleryURL')], // Using gallery URL as the first image
                    currency:
                        buyItNowPrice?.getAttribute('currencyID') || 'GBP',
                    quantity,
                    quantityAvailable,
                    quantitySold,
                    category:
                        getElementText(item, 'PrimaryCategory/CategoryID') ||
                        '',
                    location: getElementText(item, 'Location') || '',
                    listingUrl: getElementText(listingDetails, 'ViewItemURL'),
                    watchCount: getElementNumber(item, 'WatchCount'),
                    status: getElementText(item, 'ListingStatus'),
                    createdAt: new Date(
                        getElementText(item, 'StartTime') ||
                            new Date().toISOString()
                    ),
                    updatedAt: new Date(
                        getElementText(item, 'EndTime') ||
                            new Date().toISOString()
                    ),
                    shippingCost: shippingServiceCost
                        ? {
                              value: shippingServiceCost.textContent || '0',
                              currency:
                                  shippingServiceCost.getAttribute(
                                      'currencyID'
                                  ) || 'GBP',
                          }
                        : undefined,
                })
            }

            // Add the page listings to the main array
            allListings.push(...pageListings)

            // Check if we need to continue pagination
            hasMorePages = pageNumber < totalPages
            pageNumber++

            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        return allListings
    } catch (error) {
        console.error('Error in getMyEbayListings:', error)
        throw error
    }
}
