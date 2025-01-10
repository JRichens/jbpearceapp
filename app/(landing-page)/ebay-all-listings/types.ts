import { Car, EbayListing, User } from '@prisma/client'

export type GroupedListing = {
    carReg: string
    firstListed: Date | null
    totalListed: number
    totalSold: number
    listings: (EbayListing & {
        car: Car
        user: User
    })[]
}
