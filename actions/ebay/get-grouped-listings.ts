'use server'

import { db } from '@/lib/db'

export async function getGroupedListings() {
    try {
        // Get all listings grouped by car registration
        const groupedListings = await db.ebayListing.groupBy({
            by: ['carReg'],
            _sum: {
                priceListed: true,
                priceSold: true,
            },
            _min: {
                dateListed: true,
            },
        })

        // Get all listings for each car
        const detailedListings = await Promise.all(
            groupedListings.map(async (group) => {
                const listings = await db.ebayListing.findMany({
                    where: {
                        carReg: group.carReg,
                    },
                    include: {
                        car: true,
                        user: true,
                    },
                    orderBy: {
                        dateListed: 'desc',
                    },
                })

                return {
                    carReg: group.carReg,
                    firstListed: group._min.dateListed,
                    totalListed: group._sum.priceListed || 0,
                    totalSold: group._sum.priceSold || 0,
                    listings: listings,
                }
            })
        )

        return detailedListings
    } catch (error) {
        console.error('Error fetching grouped listings:', error)
        throw new Error('Failed to fetch grouped listings')
    }
}
