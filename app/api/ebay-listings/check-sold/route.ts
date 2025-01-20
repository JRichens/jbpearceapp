import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getElementText, getElementNumber } from '@/lib/ebay/utils'

async function getItemDetails(itemId: string) {
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
                </GetItemRequest>`,
        })

        const responseText = await response.text()

        if (!response.ok) {
            console.error('eBay API response:', responseText)
            throw new Error(
                `eBay API error: ${response.status} - ${response.statusText}`
            )
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        // Check for eBay API errors
        const errors = xmlDoc.getElementsByTagName('Errors')
        if (errors.length > 0) {
            const errorCode = getElementText(errors[0], 'ErrorCode')
            const errorMessage =
                getElementText(errors[0], 'LongMessage') ||
                getElementText(errors[0], 'ShortMessage')
            throw new Error(`eBay API Error ${errorCode}: ${errorMessage}`)
        }

        // Check if item exists and get its status
        const item = xmlDoc.getElementsByTagName('Item')[0]
        if (!item) {
            return null
        }

        const sellingStatus = item.getElementsByTagName('SellingStatus')[0]
        if (!sellingStatus) {
            return null
        }

        // Get listing status and sold details
        const listingStatus = getElementText(sellingStatus, 'ListingStatus')
        const currentPrice = getElementText(sellingStatus, 'CurrentPrice')
        const endTime = getElementText(item, 'EndTime')
        const bidCount = getElementNumber(sellingStatus, 'BidCount') || 0
        const quantitySold =
            getElementNumber(sellingStatus, 'QuantitySold') || 0

        // Check if item actually sold (completed with bids/quantity sold)
        const isSold =
            listingStatus === 'Completed' && (bidCount > 0 || quantitySold > 0)

        return {
            listingStatus,
            isSold,
            soldPrice: isSold && currentPrice ? parseFloat(currentPrice) : null,
            soldDate: isSold && endTime ? new Date(endTime) : null,
        }
    } catch (error) {
        console.error(`Error fetching details for item ${itemId}:`, error)
        if (
            error instanceof Error &&
            error.message.includes('eBay API Error')
        ) {
            // Rethrow eBay API errors to handle them in the main process
            throw error
        }
        return null
    }
}

export async function GET() {
    try {
        console.log('Starting to check for sold eBay listings...')

        // Check if eBay token is configured
        if (!process.env.EBAY_USER_TOKEN) {
            throw new Error(
                'EBAY_USER_TOKEN is not configured in environment variables'
            )
        }

        // Get all unsold listings
        const unsoldListings = await db.ebayListing.findMany({
            where: {
                priceSold: null,
            },
            select: {
                id: true,
                ebayUrl: true,
            },
        })

        console.log(`Found ${unsoldListings.length} unsold listings to check`)

        let updatedCount = 0
        let errorCount = 0

        // Configuration for rate limiting
        const CONFIG = {
            batchSize: 10, // Number of items to process in parallel
            delayBetweenRequests: 100, // Milliseconds to wait between API calls
            maxRetries: 3, // Maximum number of retries for failed requests
        } as const

        // Process listings in batches
        console.log(`Processing in batches of ${CONFIG.batchSize}...`)
        const totalBatches = Math.ceil(unsoldListings.length / CONFIG.batchSize)

        for (let i = 0; i < unsoldListings.length; i += CONFIG.batchSize) {
            const batchNumber = Math.floor(i / CONFIG.batchSize) + 1
            console.log(`Processing batch ${batchNumber}/${totalBatches}...`)
            const batch = unsoldListings.slice(i, i + CONFIG.batchSize)

            await Promise.all(
                batch.map(async (listing) => {
                    // Extract item ID from eBay URL
                    const itemId = listing.ebayUrl.split('/').pop()
                    if (!itemId) return

                    try {
                        // Get item details from eBay
                        const itemDetails = await getItemDetails(itemId)

                        if (!itemDetails) {
                            console.error(
                                `Failed to get details for item ${itemId}`
                            )
                            errorCount++
                            return
                        }

                        if (itemDetails.isSold) {
                            console.log(
                                `Item ${itemId} has sold for ${itemDetails.soldPrice}`
                            )
                            // Update database if item is sold
                            await db.ebayListing.update({
                                where: { id: listing.id },
                                data: {
                                    priceSold: itemDetails.soldPrice,
                                    dateSold: itemDetails.soldDate,
                                },
                            })
                            updatedCount++
                        }

                        // Add configurable delay to avoid rate limiting
                        await new Promise((resolve) =>
                            setTimeout(resolve, CONFIG.delayBetweenRequests)
                        )
                    } catch (error) {
                        console.error(`Error processing item ${itemId}:`, error)
                        errorCount++
                    }
                })
            )
        }

        console.log(`
Processing complete:
- Total items checked: ${unsoldListings.length}
- Items sold and updated: ${updatedCount}
- Errors encountered: ${errorCount}
- Success rate: ${((updatedCount / unsoldListings.length) * 100).toFixed(1)}%
`)

        return NextResponse.json({
            success: true,
            message: `Checked ${unsoldListings.length} listings, updated ${updatedCount} sold items, encountered ${errorCount} errors`,
        })
    } catch (error) {
        console.error('Error checking sold items:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        )
    }
}
