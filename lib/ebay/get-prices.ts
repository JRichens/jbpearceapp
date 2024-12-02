interface EbayItem {
    title: string
    price: number
    url: string
    condition: string
    location: string
    imageUrl: string
    status: 'active' | 'sold'
    category: {
        id: string
        name: string
    }
}

interface CategoryInfo {
    id: string
    name: string
    fullPath: string
    finalName: string
}

interface SearchTerms {
    modelSeries: string
    year: string
}

interface EbayPricesResponse {
    results: EbayItem[]
    category: CategoryInfo | null
    searchTerms: SearchTerms
}

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
