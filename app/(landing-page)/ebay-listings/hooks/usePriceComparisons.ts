import { useEffect, useState } from 'react'
import { Car } from '@prisma/client'
import { Category } from '../types/listingTypes'
import { EbayItem } from '../types/ebayTypes'

export function usePriceComparisons(
    vehicle: Car | null,
    searchTerm: string,
    selectedCategory: Category | null
) {
    const [priceComparisons, setPriceComparisons] = useState<EbayItem[]>([])
    const [searchTerms, setSearchTerms] = useState<{
        modelSeries: string
        year: string
    } | null>(null)
    const [isLoadingPrices, setIsLoadingPrices] = useState(false)

    useEffect(() => {
        const fetchPrices = async () => {
            if (!searchTerm) return

            setIsLoadingPrices(true)
            try {
                // Only include vehicle-related fields if vehicle is not null
                const requestBody = {
                    partDescription: searchTerm,
                    categoryId: selectedCategory?.id,
                    ...(vehicle && {
                        make: vehicle.dvlaMake,
                        model: vehicle.dvlaModel,
                        modelSeries: vehicle.modelSeries,
                    }),
                }

                const response = await fetch('/api/ebay-listings/get-prices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch prices')
                }

                const data = await response.json()
                console.log('Price comparison data:', data)

                setPriceComparisons(data.results)
                setSearchTerms(data.searchTerms)
            } catch (error) {
                console.error('Error fetching prices:', error)
                setPriceComparisons([])
                setSearchTerms(null)
            } finally {
                setIsLoadingPrices(false)
            }
        }

        fetchPrices()
    }, [searchTerm, vehicle, selectedCategory])

    return {
        priceComparisons,
        searchTerms,
        isLoadingPrices,
    }
}
