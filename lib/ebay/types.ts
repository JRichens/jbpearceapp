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

export interface EbayListing {
    itemId: string
    title: string
    price: number
    watchCount?: number
    quantity: number
    quantitySold: number
    status: string
}
