import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import {
    EbayItem,
    EbayPricesResponse,
} from '@/app/(landing-page)/ebay-listings/types/ebayTypes'

const getTotalPrice = (item: EbayItem): number => {
    return item.basePrice + (item.shippingCost || 0)
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

const normalizeText = (text: string): string => {
    const textBeforeBracket = text.split('(')[0]
    return textBeforeBracket
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim()
}

const extractPartDescription = (
    fullDescription: string,
    make?: string,
    model?: string
): string => {
    let cleanDescription = fullDescription
    if (make) {
        cleanDescription = cleanDescription.replace(new RegExp(make, 'gi'), '')
    }
    if (model) {
        cleanDescription = cleanDescription.replace(new RegExp(model, 'gi'), '')
    }
    return cleanDescription.trim()
}

const getFirstWordOfModel = (model?: string): string => {
    return model?.split(' ')[0] || ''
}

const searchCache = new Map<string, Promise<EbayItem[]>>()

const processEbayItems = (
    $: cheerio.CheerioAPI,
    items: cheerio.Cheerio<cheerio.Element>,
    isActive: boolean,
    categoryId?: string
): EbayItem[] => {
    const results: EbayItem[] = []

    const itemsArray = items.toArray().slice(2)

    for (const item of itemsArray) {
        const $item = $(item)

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
            return results
        }

        try {
            if (!$item.hasClass('s-item')) continue
            if ($item.find('[data-track="advertisement"]').length > 0) continue

            const $mainLink = $item.find('.s-item__link')
            const url = $mainLink.attr('href')

            const title = $item
                .find('.s-item__title span[role="heading"]')
                .text()
                .trim()

            const priceText = $item.find('.s-item__price').first().text().trim()
            const basePrice = getPriceValue(priceText)

            const imageUrl = $item
                .find('.s-item__image-wrapper img')
                .attr('src')

            const condition = $item
                .find('.SECONDARY_INFO')
                .first()
                .text()
                .trim()

            const sellerInfo = $item
                .find('.s-item__seller-info-text')
                .text()
                .trim()

            const collectionElements = $item.find(
                [
                    '.s-item__dynamic.s-item__localDeliveryWithDistance',
                    '.s-item__shipping',
                    '.s-item__logisticsCost',
                    '.s-item__freeXDays',
                    '.s-item__dynamic:contains("Collection")',
                    '.s-item__dynamic:contains("collection")',
                    '.s-item__dynamic:contains("Pickup")',
                    '.s-item__dynamic:contains("pickup")',
                ].join(', ')
            )

            const allDeliveryText = collectionElements
                .map((_, el) => $(el).text().trim().toLowerCase())
                .get()
                .join(' ')

            // console.log('Delivery info for item:', {
            //     title,
            //     allDeliveryText,
            //     elements: collectionElements.length,
            // })

            let isCollectionOnly = false
            let collectionLocation = undefined
            let collectionDistance = undefined
            let shippingCost = undefined

            const collectionIndicators = [
                'collection only',
                'collection in person',
                'local pickup',
                'collect in person',
                'collection from',
                'click & collect',
            ]

            if (
                collectionIndicators.some((indicator) =>
                    allDeliveryText.includes(indicator)
                )
            ) {
                // console.log('Found collection only item:', { allDeliveryText })
                isCollectionOnly = true

                collectionElements.each((_, el) => {
                    const text = $(el).text().trim()
                    const match = text.match(/collection only: (.+) from (.+)/i)
                    if (match) {
                        collectionDistance = match[1]
                        collectionLocation = match[2]
                    }
                })
            } else {
                const hasShipping =
                    allDeliveryText.includes('postage') ||
                    allDeliveryText.includes('shipping') ||
                    allDeliveryText.includes('delivery')

                if (hasShipping) {
                    const shippingMatch = allDeliveryText.match(
                        /[£$](\d+(?:\.\d{2})?)/
                    )
                    shippingCost = shippingMatch
                        ? parseFloat(shippingMatch[1])
                        : 0
                } else {
                    shippingCost = 0
                }
            }

            const hasBestOffer =
                $item.find('.s-item__dynamic.s-item__formatBestOfferEnabled')
                    .length > 0

            const couponText = $item
                .find('.s-item__sme.s-item__smeInfo .NEGATIVE.BOLD')
                .text()
                .trim()

            let soldDate
            if (!isActive) {
                const soldDateText = $item
                    .find('.s-item__caption .s-item__caption--signal span')
                    .text()
                    .trim()
                soldDate = soldDateText.replace('Sold', '').trim()
            }

            if (title && !isNaN(basePrice) && url) {
                const item: EbayItem = {
                    title,
                    basePrice,
                    shippingCost: isCollectionOnly ? undefined : shippingCost,
                    url,
                    condition: condition || 'Not Specified',
                    location: 'United Kingdom',
                    imageUrl:
                        imageUrl ||
                        'https://i.ebayimg.com/images/g/0kYAAOSwm~daXVfM/s-l140.jpg',
                    status: isActive ? 'active' : 'sold',
                    soldDate: soldDate || undefined,
                    sellerInfo: sellerInfo || undefined,
                    hasBestOffer: hasBestOffer || false,
                    couponDiscount: couponText || undefined,
                    isCollectionOnly: isCollectionOnly || false,
                    collectionLocation: collectionLocation || undefined,
                    collectionDistance: collectionDistance || undefined,
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
    }&LH_ItemCondition=3000&rt=nc&_ipg=240`

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
    }&LH_ItemCondition=3000&rt=nc&LH_Sold=1&LH_Complete=1&_ipg=240`

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

        searchCache.clear()

        const actualPartDescription = extractPartDescription(
            partDescription,
            make,
            model
        )

        // For manual searches (when make/model/modelSeries are not provided),
        // just use the part description as the search term
        const baseSearchTerm = actualPartDescription.trim().replace(/&/g, '')
        let modelSeriesSearchTerm = baseSearchTerm

        // Only append vehicle details if they are provided
        if (make || model || modelSeries) {
            const firstWordOfModel = getFirstWordOfModel(model)
            const vehicleDetails = [make, firstWordOfModel, modelSeries]
                .filter(Boolean)
                .join(' ')
            modelSeriesSearchTerm = `${baseSearchTerm} ${vehicleDetails}`.trim()
        }

        const yearSearchTerm = year
            ? `${baseSearchTerm} ${make} ${getFirstWordOfModel(model)} ${year}`
                  .trim()
                  .replace(/&/g, '')
            : null

        console.log('Search terms:', {
            baseSearchTerm,
            modelSeriesSearchTerm,
            yearSearchTerm,
            willPerformYearSearch: !!yearSearchTerm,
        })

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

        const allResults = [
            ...modelSeriesActiveResults,
            ...modelSeriesSoldResults,
            ...(yearActiveResults || []),
            ...(yearSoldResults || []),
        ]

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

        const response: EbayPricesResponse = {
            results: uniqueResults.sort(
                (a, b) => getTotalPrice(a) - getTotalPrice(b)
            ),
            category: null,
            searchTerms: {
                modelSeries: modelSeriesSearchTerm,
                year: yearSearchTerm || modelSeriesSearchTerm,
            },
        }

        return NextResponse.json(response)
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
