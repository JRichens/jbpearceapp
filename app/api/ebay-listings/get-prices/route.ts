import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface EbayItem {
    title: string
    price: number
    url: string
    condition: string
    location: string
    imageUrl: string
    status: 'active' | 'sold'
    soldDate?: string
    sellerInfo?: string
    hasBestOffer?: boolean
    couponDiscount?: string
    category: {
        id: string
        name: string
    }
}

const getPriceValue = (priceText: string): number => {
    const cleanPrice = priceText
        .replace('£', '')
        .replace(',', '')
        .split(' ')[0]
        .trim()

    if (cleanPrice.toLowerCase().includes('best offer accepted')) {
        return 0
    }

    return parseFloat(cleanPrice) || 0
}

// Function to normalize text for comparison
const normalizeText = (text: string): string => {
    // Get text before the first opening bracket, or use the whole text if no bracket
    const textBeforeBracket = text.split('(')[0]

    return textBeforeBracket
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .trim()
}

// Function to extract actual part description
const extractPartDescription = (
    fullDescription: string,
    make: string,
    model: string
): string => {
    // Remove make and model from the description
    let cleanDescription = fullDescription
    if (make) {
        cleanDescription = cleanDescription.replace(new RegExp(make, 'gi'), '')
    }
    if (model) {
        cleanDescription = cleanDescription.replace(new RegExp(model, 'gi'), '')
    }
    return cleanDescription.trim()
}

// Function to get first word of model
const getFirstWordOfModel = (model: string): string => {
    return model?.split(' ')[0] || ''
}

// Cache to store search results and prevent duplicate searches
const searchCache = new Map<string, Promise<EbayItem[]>>()

const processEbayItems = (
    $: cheerio.CheerioAPI,
    items: cheerio.Cheerio<cheerio.Element>,
    isActive: boolean,
    categoryId?: string
): EbayItem[] => {
    const results: EbayItem[] = []

    // Convert items to array to use for...of loop, skip first item (advertisement)
    const itemsArray = items.toArray().slice(2)

    for (const item of itemsArray) {
        const $item = $(item)

        // Check for the "Results matching fewer words" notice
        const isRewriteStart =
            $item.hasClass('srp-river-answer--REWRITE_START') &&
            $item
                .find('.section-notice__main')
                .text()
                .includes('Results matching fewer words')

        if (isRewriteStart) {
            console.log(
                'Found "Results matching fewer words" notice, stopping processing'
            )
            return results // Return immediately with current results
        }

        try {
            // Skip if not an item listing
            if (!$item.hasClass('s-item')) continue

            // Skip if it's an advertisement (additional check)
            if ($item.find('[data-track="advertisement"]').length > 0) continue

            // Get the URL from the main link
            const $mainLink = $item.find('.s-item__link')
            const url = $mainLink.attr('href')

            // Extract data using the correct selectors
            const title = $item
                .find('.s-item__title span[role="heading"]')
                .text()
                .trim()

            const priceText = $item.find('.s-item__price').first().text().trim()
            const price = getPriceValue(priceText)

            const imageUrl = $item
                .find('.s-item__image-wrapper img')
                .attr('src')

            const condition = $item
                .find('.SECONDARY_INFO')
                .first()
                .text()
                .trim()

            // Get seller info
            const sellerInfo = $item
                .find('.s-item__seller-info-text')
                .text()
                .trim()

            // Get shipping cost
            const shippingText = $item
                .find('.s-item__shipping, .s-item__logisticsCost')
                .text()
                .trim()
            const hasShipping = shippingText.includes('postage')
            const shippingCost = hasShipping
                ? parseFloat(shippingText.replace(/[^0-9.]/g, '')) || 0
                : 0

            // Check for best offer
            const hasBestOffer =
                $item.find('.s-item__dynamic.s-item__formatBestOfferEnabled')
                    .length > 0

            // Get coupon information
            const couponText = $item
                .find('.s-item__sme.s-item__smeInfo .NEGATIVE.BOLD')
                .text()
                .trim()

            // For sold items, get the sold date
            let soldDate
            if (!isActive) {
                const soldDateText = $item
                    .find('.s-item__caption .s-item__caption--signal span')
                    .text()
                    .trim()
                soldDate = soldDateText.replace('Sold', '').trim()
            }

            // Only add valid items
            if (title && !isNaN(price) && url) {
                const item: EbayItem = {
                    title,
                    price: price + shippingCost,
                    url,
                    condition: condition || 'Not Specified',
                    location: 'United Kingdom',
                    imageUrl:
                        imageUrl ||
                        'https://i.ebayimg.com/images/g/0kYAAOSwm~daXVfM/s-l140.jpg',
                    status: isActive ? 'active' : 'sold',
                    ...(soldDate && { soldDate }),
                    sellerInfo,
                    hasBestOffer,
                    couponDiscount: couponText || undefined,
                    category: {
                        id: categoryId || 'all',
                        name: categoryId ? 'Used Parts' : 'All Categories',
                    },
                }
                results.push(item)
            }
        } catch (error: unknown) {
            console.error(
                `Error parsing ${isActive ? 'active' : 'sold'} item:`,
                error
            )
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack)
            }
        }
    }

    return results
}

async function searchEbayAPI(
    searchTerm: string,
    categoryId?: string
): Promise<EbayItem[]> {
    const cacheKey = `active:${searchTerm}:${categoryId || 'all'}`

    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm)
    const url = `https://www.ebay.co.uk/sch/i.html?_from=R40&_nkw=${encodedSearchTerm}${
        categoryId ? `&_sacat=${categoryId}` : ''
    }&LH_ItemCondition=3000&rt=nc`

    console.log('Active search URL:', url)

    const searchPromise = (async () => {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch active items: ${response.statusText}`
                )
            }

            const html = await response.text()
            const $ = cheerio.load(html)

            // Get all items including notices
            const items = $('li.s-item, li.srp-river-answer--REWRITE_START')
            const results = processEbayItems($, items, true, categoryId)

            console.log(
                `Found ${results.length} active results for search term: "${searchTerm}"`
            )
            return results
        } catch (error: unknown) {
            console.error('Error in active search:', error)
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack)
            }
            return []
        }
    })()

    searchCache.set(cacheKey, searchPromise)
    return searchPromise
}

async function searchEbaySoldItems(
    searchTerm: string,
    categoryId?: string
): Promise<EbayItem[]> {
    const cacheKey = `sold:${searchTerm}:${categoryId || 'all'}`

    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm)
    const url = `https://www.ebay.co.uk/sch/i.html?_from=R40&_nkw=${encodedSearchTerm}${
        categoryId ? `&_sacat=${categoryId}` : ''
    }&_sop=15&LH_ItemCondition=3000&rt=nc&LH_Sold=1&LH_Complete=1`

    console.log('Sold items search URL:', url)

    const searchPromise = (async () => {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch sold items: ${response.statusText}`
                )
            }

            const html = await response.text()
            const $ = cheerio.load(html)

            // Get all items including notices
            const items = $('li.s-item, li.srp-river-answer--REWRITE_START')
            const results = processEbayItems($, items, false, categoryId)

            console.log(
                `Found ${results.length} sold results for search term: "${searchTerm}"`
            )
            return results
        } catch (error: unknown) {
            console.error('Error in sold items search:', error)
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack)
            }
            return []
        }
    })()

    searchCache.set(cacheKey, searchPromise)
    return searchPromise
}

export async function POST(req: Request) {
    try {
        const { partDescription, make, model, modelSeries, categoryId, year } =
            await req.json()

        console.log('Received request with:', {
            partDescription,
            make,
            model,
            modelSeries,
            categoryId,
            year,
        })

        // Clear the cache for each request to ensure fresh results
        searchCache.clear()

        // Extract the actual part description by removing make and model
        const actualPartDescription = extractPartDescription(
            partDescription,
            make,
            model
        )

        // Get the first word of the model
        const firstWordOfModel = getFirstWordOfModel(model)

        // Base search term is just the actual part description
        const baseSearchTerm = actualPartDescription.trim().replace(/&/g, '')

        // Add make, first word of model, and model series for the model series search
        const modelSeriesSearchTerm =
            `${baseSearchTerm} ${make} ${firstWordOfModel} ${modelSeries}`
                .trim()
                .replace(/&/g, '')

        // Add make, first word of model, and year for the year search
        const yearSearchTerm = year
            ? `${baseSearchTerm} ${make} ${firstWordOfModel} ${year}`
                  .trim()
                  .replace(/&/g, '')
            : null

        console.log('Search terms:', {
            baseSearchTerm,
            modelSeriesSearchTerm,
            yearSearchTerm,
            willPerformYearSearch: !!yearSearchTerm,
        })

        // Perform searches with both terms
        const results = await Promise.allSettled([
            searchEbayAPI(modelSeriesSearchTerm, categoryId),
            searchEbaySoldItems(modelSeriesSearchTerm, categoryId),
            ...(yearSearchTerm
                ? [
                      searchEbayAPI(yearSearchTerm, categoryId),
                      searchEbaySoldItems(yearSearchTerm, categoryId),
                  ]
                : []),
        ])

        const [
            modelSeriesActiveResults,
            modelSeriesSoldResults,
            yearActiveResults,
            yearSoldResults,
        ] = results.map((result) =>
            result.status === 'fulfilled' ? result.value : []
        )

        // Combine all results
        const allResults = [
            ...modelSeriesActiveResults,
            ...modelSeriesSoldResults,
            ...(yearActiveResults || []),
            ...(yearSoldResults || []),
        ]

        // Remove duplicates based on normalized titles (text before brackets)
        const titleMap = new Map<string, EbayItem>()
        allResults.forEach((item) => {
            const normalizedTitle = normalizeText(item.title)
            if (!titleMap.has(normalizedTitle)) {
                titleMap.set(normalizedTitle, item)
            }
        })

        const uniqueResults = Array.from(titleMap.values())

        console.log('Results summary:', {
            totalResults: allResults.length,
            uniqueResults: uniqueResults.length,
        })

        return NextResponse.json({
            results: uniqueResults.sort((a, b) => a.price - b.price),
            category: null,
            searchTerms: {
                modelSeries: modelSeriesSearchTerm,
                year: yearSearchTerm || modelSeriesSearchTerm,
            },
        })
    } catch (error: unknown) {
        console.error('Error in get-prices route:', error)
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack)
        }
        return NextResponse.json(
            { error: 'Failed to fetch eBay prices' },
            { status: 500 }
        )
    }
}
