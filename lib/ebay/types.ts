export interface Vehicle {
    dvlaMake?: string
    dvlaModel?: string
    dvlaYearOfManufacture?: string
    modelSeries?: string
    modelVariant?: string
    colourCurrent?: string
    engineCode?: string
    engineCapacity?: string
    fuelType?: string
    transmission?: string
    driveType?: string
    euroStatus?: string
    vinOriginalDvla?: string
    paintCode?: string
}

export interface CreateListingParams {
    title: string
    description: string
    compatibility?: string
    price: number
    condition: string
    conditionDescription?: string
    imageUrls: string[]
    currency?: string
    quantity?: number
    category: string
    location: string
    partNumber?: string
    brand?: string
    make?: string
    placement?: string
    paintCode?: string
    vehicle?: Vehicle
    shippingProfileId?: string
    allowOffers?: boolean
    minimumOfferPrice?: number
}

export interface ShippingProfile {
    profileId: string
    profileName: string
    description: string
    isDefault: boolean
    categoryGroups: any[] // Using any[] since the actual type isn't shown in the code
}

export interface EbayListing {
    id: string
    itemId: string
    title: string
    description: string
    price: {
        value: number | string
        currency?: string
    }
    listingStatus: string
    condition: string
    imageUrl?: string
    imageUrls?: string[]
    currency: string
    quantity: number
    quantityAvailable: number
    quantitySold: number
    category: string
    location: string
    listingUrl: string
    watchCount?: number
    status?: string
    shippingCost?: {
        value: number | string
        currency?: string
    }
    createdAt: Date
    updatedAt: Date
}
