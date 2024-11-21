export interface EbayListing {
    itemId: string
    title: string
    price: {
        value: string
        currency: string
    }
    listingStatus: string
    imageUrl?: string
    listingUrl: string
    watchCount: number
    quantityAvailable: number
    shippingCost?: {
        value: string
        currency: string
    }
}

export interface CreateListingParams {
    title: string
    description: string
    price: string
    condition: string
    conditionDescription?: string
    imageUrls: string[]
    currency?: string
    quantity?: number
    listingDuration?: string
    category: string
    shippingProfileId: string
    location: string
    returnPeriod?: string // Made optional since it's handled by the profile
}

export interface ShippingProfile {
    profileId: string
    profileName: string
    description?: string
    categoryGroups?: string[]
    isDefault?: boolean
}
