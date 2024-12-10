export interface EbayItem {
    title: string
    basePrice: number
    shippingCost?: number | undefined
    url: string
    condition: string
    location: string
    imageUrl: string
    status: 'active' | 'sold'
    soldDate?: string | undefined
    sellerInfo?: string | undefined
    hasBestOffer: boolean
    couponDiscount?: string | undefined
    isCollectionOnly: boolean
    collectionLocation?: string | undefined
    collectionDistance?: string | undefined
    category: {
        id: string
        name: string
    }
}

export interface EbayPricesResponse {
    results: EbayItem[]
    category: {
        id: string
        name: string
        fullPath: string
        finalName: string
    } | null
    searchTerms: {
        modelSeries: string
        year: string
    }
}
