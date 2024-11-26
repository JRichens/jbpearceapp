export interface Vehicle {
    vinOriginalDvla?: string
    dvlaYearOfManufacture?: string
    dvlaModel?: string
    dvlaMake?: string
    modelSeries?: string
    modelVariant?: string
    colourCurrent?: string
    engineCode?: string
    engineCapacity?: string
    fuelType?: string
    transmission?: string
    driveType?: string
    euroStatus?: string
}

export interface CreateListingParams {
    title: string
    description: string
    price: string | number // Allow both string and number
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
    compatibility?: string // Added compatibility field
}

export interface EbayListing {
    id: string
    title: string
    description: string
    price: string | number // Allow both string and number
    condition: string
    conditionDescription?: string
    imageUrls: string[]
    currency: string
    quantity: number
    category: string
    location: string
    partNumber?: string
    brand?: string
    make?: string
    placement?: string
    paintCode?: string
    vehicle?: Vehicle
    createdAt: Date
    updatedAt: Date
    watchCount?: number // Added watchCount field
    shippingProfileId?: string // Added this field
}

export interface EbayListingResponse {
    listing: EbayListing
    fees: {
        insertionFee: string
        totalFees: string
    }
}
