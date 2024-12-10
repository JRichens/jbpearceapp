import {
    EbayItem,
    EbayPricesResponse,
} from '@/app/(landing-page)/ebay-listings/types/ebayTypes'

export async function getEbayPrices(
    partDescription: string,
    make: string | null,
    model: string | null,
    modelSeries: string | null,
    categoryId: string | undefined,
    year: string | null
): Promise<EbayPricesResponse> {
    try {
        const response = await fetch('/api/ebay-listings/get-prices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partDescription,
                make: make || '',
                model: model || '',
                modelSeries: modelSeries || '',
                categoryId,
                year,
            }),
        })

        if (!response.ok) {
            throw new Error(
                `Failed to fetch eBay prices: ${response.statusText}`
            )
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching eBay prices:', error)
        throw error
    }
}
