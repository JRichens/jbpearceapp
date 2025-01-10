import { Car, EbayListing, User } from '@prisma/client'

export type GroupedListing = {
    carReg: string
    firstListed: Date | null
    totalListed: number
    totalSold: number
    dvlaMake: string
    dvlaModel: string
    modelSeries: string
    listings: (EbayListing & {
        car: Car
        user: User
    })[]
}
