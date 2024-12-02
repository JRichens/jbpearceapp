import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Car } from '@prisma/client'
import { getEbayPrices } from '@/lib/ebay/get-prices'
import { Category } from '../types/listingTypes'

export function usePriceComparisons(
    vehicle: Car | null,
    partDescription: string,
    selectedCategory: Category | null
) {
    const [priceComparisons, setPriceComparisons] = useState<
        Array<{
            title: string
            price: number
            url: string
            condition: string
            location: string
            imageUrl: string
            status: 'active' | 'sold'
            soldDate?: string
            sellerInfo?: string
        }>
    >([])
    const [searchTerms, setSearchTerms] = useState<{
        modelSeries: string
        year: string
    } | null>(null)
    const [isLoadingPrices, setIsLoadingPrices] = useState(false)
    const { toast } = useToast()

    // Use a ref to track the current request
    const currentRequestRef = useRef<string | null>(null)

    // Use a ref to track if component is mounted
    const isMounted = useRef(true)

    useEffect(() => {
        // Set mounted flag
        isMounted.current = true

        return () => {
            // Clear mounted flag on cleanup
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        const fetchPrices = async () => {
            if (!partDescription) return

            // Generate a unique request ID
            const requestId = `${
                selectedCategory?.id || 'all'
            }-${partDescription}-${Date.now()}`
            currentRequestRef.current = requestId

            setIsLoadingPrices(true)
            try {
                // Only proceed if this is still the current request
                if (
                    currentRequestRef.current === requestId &&
                    isMounted.current
                ) {
                    const response = await getEbayPrices(
                        partDescription,
                        vehicle?.dvlaMake || null,
                        vehicle?.dvlaModel || null,
                        vehicle?.modelSeries || null,
                        selectedCategory?.id,
                        vehicle?.dvlaYearOfManufacture?.toString() || null
                    )

                    // Check again before updating state
                    if (
                        currentRequestRef.current === requestId &&
                        isMounted.current
                    ) {
                        setPriceComparisons(response.results)
                        setSearchTerms(response.searchTerms)
                    }
                }
            } catch (error) {
                // Only show error if this is still the current request
                if (
                    currentRequestRef.current === requestId &&
                    isMounted.current
                ) {
                    console.error('Error fetching prices:', error)
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch price comparisons',
                        variant: 'destructive',
                    })
                }
            } finally {
                // Only update loading state if this is still the current request
                if (
                    currentRequestRef.current === requestId &&
                    isMounted.current
                ) {
                    setIsLoadingPrices(false)
                }
            }
        }

        // Create a debounced version of fetchPrices
        const timeoutId = setTimeout(fetchPrices, 300)

        return () => {
            clearTimeout(timeoutId)
            // Clear current request on cleanup
            currentRequestRef.current = null
        }
    }, [selectedCategory, vehicle, partDescription])

    return {
        priceComparisons,
        searchTerms,
        isLoadingPrices,
    }
}
