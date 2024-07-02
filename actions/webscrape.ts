'use server'

import { JSDOM } from 'jsdom'
import { load } from 'cheerio'
import { Anthropic } from '@anthropic-ai/sdk'

interface eBayItem {
    title: string
    soldPrice: string
    soldDate: string
}

interface ScrapedItemResult {
    itemName: string
    data: eBayItem[]
}

export async function WebScrape(url: string) {
    const anthropic = new Anthropic()

    const res = await fetch(url)
    const html = await res.text()
    const dom = new JSDOM(html)
    const text = dom.window.document.body.textContent

    const ul = dom.window.document.querySelector(
        'ul.srp-results.srp-list.clearfix'
    )
    const items = ul ? ul.textContent : ''

    // console.log('html as Text: ', items)

    const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        temperature: 0,
        system: 'You are an expert at analysing web scrapped data from eBay listings. The data you are given is from a list of used items that have sold on eBay. Identify trends such as the average price these items sold for what the lowest and highest prices were',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: items ? items : '',
                    },
                ],
            },
        ],
    })

    return msg
}

export async function WebScrapeCountListings(
    url: string
): Promise<string | null> {
    try {
        const res = await fetch(url, { cache: 'no-store' })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const html = await res.text()
        const dom = new JSDOM(html)

        // Target the specific span element with number of results
        const countSpan = dom.window.document.querySelector(
            '.srp-controls__count-heading .BOLD'
        )

        return countSpan?.textContent || null
    } catch (error) {
        console.error('Error scraping listing count:', error)
        return null
    }
}

export async function WebScrapeAnalyseItems(
    url: string,
    items: string,
    vehicleSearchTerm: string
) {
    const anthropic = new Anthropic()

    // Parse the items string to a number, removing any commas
    const itemsNumber = parseInt(items.replace(/,/g, ''), 10)

    // Calculate how many pages to scrape, based on the number of items
    let numberOfPages = Math.min(Math.ceil(itemsNumber / 240), 10)

    const fetchPage = async (pageUrl: string) => {
        const res = await fetch(pageUrl, { cache: 'no-store' })
        return res.text()
    }

    const pageUrls = Array.from({ length: numberOfPages }, (_, i) =>
        i === 0 ? url : `${url}&_pgn=${i + 1}`
    )

    try {
        const htmlPages = await Promise.all(pageUrls.map(fetchPage))

        const eBayItems: eBayItem[] = []

        for (const html of htmlPages) {
            const $ = load(html)
            const liElements = $('ul.srp-results.srp-list.clearfix li')

            let shouldStop = false

            liElements.each((_, li) => {
                const $li = $(li)
                if ($li.hasClass('srp-river-answer--REWRITE_START')) {
                    shouldStop = true
                    return false // break the .each() loop
                }
                if (
                    !$li.hasClass('s-item') ||
                    $li.hasClass('srp-river-answer')
                ) {
                    return // continue to next iteration
                }

                const title = $li
                    .find('div.s-item__title span[role="heading"]')
                    .text()
                    .trim()
                const soldPrice = $li
                    .find('span.s-item__price span.POSITIVE')
                    .text()
                    .trim()
                const captionText = $li
                    .find('div.s-item__caption')
                    .text()
                    .trim()
                const dateMatch = captionText.match(
                    /(\d{1,2}\s[A-Za-z]{3}\s\d{4})$/
                )
                const soldDate = dateMatch ? dateMatch[1] : ''

                if (title && soldPrice && soldDate) {
                    eBayItems.push({ title, soldPrice, soldDate })
                }

                if (eBayItems.length >= itemsNumber) {
                    return false // break the .each() loop
                }
            })

            if (shouldStop || eBayItems.length >= itemsNumber) {
                break // break the for loop over pages
            }
        }

        // Trim the array to the requested number of items
        const finalItems = eBayItems.slice(0, itemsNumber)

        // Console log the first item and last item of the array of objects
        // console.log('First item:', finalItems[0])
        // console.log('Last item:', finalItems[finalItems.length - 1])

        console.log('Total items:', finalItems.length)
        return finalItems
    } catch (error) {
        console.error('Error fetching eBay listings:', error)
        throw new Error('Failed to fetch eBay listings')
    }
}

export async function WebScrapeIndividualItems(vehicleSearchTerm: string) {
    const itemParams = [
        {
            item: 'Engine',
            category: '33615',
            extraSearch: '',
        },
        {
            item: 'Rear Light',
            category: '33716',
            extraSearch: '',
        },
        {
            item: 'Headlight',
            category: '33710',
            extraSearch: '',
        },
        {
            item: 'Wing Mirror',
            category: '262161',
            extraSearch: '',
        },
        {
            item: 'ECU',
            category: '33596',
            extraSearch: '',
        },
        {
            item: 'ECU Kit',
            category: '6030',
            extraSearch: '',
        },
        {
            item: 'Airbag kit',
            category: '33694',
            extraSearch: '',
        },
        {
            item: 'Body Control Module',
            category: '6030',
            extraSearch: '',
        },
        {
            item: 'Alternator',
            category: '177697',
            extraSearch: '',
        },
        {
            item: 'Alloy Wheel',
            category: '179681',
            extraSearch: '',
        },
        {
            item: 'Gearbox',
            category: '33726',
            extraSearch: '',
        },
        {
            item: 'Fuel injector',
            category: '33594',
            extraSearch: '',
        },
        {
            item: 'Steering rack',
            category: '33598',
            extraSearch: '',
        },
        {
            item: 'Turbocharger',
            category: '174107',
            extraSearch: '',
        },
        {
            item: 'Parcel shelf',
            category: '174084',
            extraSearch: '',
        },
        {
            item: 'Front Door',
            category: '179850',
            extraSearch: '',
        },
        {
            item: 'Rear Door',
            category: '179850',
            extraSearch: '',
        },
        {
            item: 'Instrument Cluster',
            category: '33672',
            extraSearch: '',
        },
        {
            item: 'ABS Pump',
            category: '33559',
            extraSearch: '',
        },
        {
            item: 'Power Steering Pump',
            category: '33588',
            extraSearch: '',
        },
        {
            item: 'Fuel pump',
            category: '33555',
            extraSearch: '',
        },
        {
            item: 'Head Unit',
            category: '174119',
            extraSearch: '',
        },
        {
            item: 'Steering Wheel',
            category: '33704',
            extraSearch: '',
        },
        {
            item: 'Bonnet',
            category: '33646',
            extraSearch: '',
        },
        {
            item: 'Front bumper',
            category: '33640',
            extraSearch: '',
        },
        {
            item: 'Rear Bumper',
            category: '33640',
            extraSearch: '',
        },
        {
            item: 'Tailgate',
            category: '33656',
            extraSearch: '',
        },
        {
            item: 'Wing',
            category: '262165',
            extraSearch: '',
        },
        {
            item: 'Door Lock Mechanism',
            category: '33648',
            extraSearch: '',
        },
        {
            item: 'Space Saver',
            category: '179681',
            extraSearch: '',
        },
        {
            item: 'Differential',
            category: '262245',
            extraSearch: '',
        },
    ]

    const results: ScrapedItemResult[] = []

    for (const param of itemParams) {
        const url = `https://www.ebay.co.uk/sch/${
            param.category
        }/i.html?_from=R0&_nkw=${encodeURIComponent(
            vehicleSearchTerm
        )} ${encodeURIComponent(param.item)}${
            param.extraSearch ? ' ' + encodeURIComponent(param.extraSearch) : ''
        }&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240`

        try {
            const itemResults = await WebScrapeAnalyseItems(
                url,
                '240',
                vehicleSearchTerm
            )
            results.push({
                itemName: param.item,
                data: itemResults,
            })
            console.log(`Scraped ${itemResults.length} items for ${param.item}`)
        } catch (error) {
            console.error(`Error scraping ${param.item}:`, error)
            results.push({
                itemName: param.item,
                data: [],
            })
        }

        // Add a delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
}
