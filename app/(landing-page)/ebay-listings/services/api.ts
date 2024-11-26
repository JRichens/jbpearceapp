import { toast } from 'sonner'
import { Car } from '@prisma/client'
import { Category, FormState } from '../types/listingTypes'

export const fetchCategoriesApi = async (
    searchTerm: string
): Promise<Category[]> => {
    try {
        const response = await fetch(
            `/api/ebay-listings/categories?search=${encodeURIComponent(
                searchTerm
            )}&useVehicleSearch=true`
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch categories')
        }

        if (!Array.isArray(data)) {
            throw new Error('Invalid response format')
        }

        return data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const submitListing = async (
    formData: FormData,
    action: 'verify' | 'submit',
    vehicle: Car | null
): Promise<any> => {
    formData.append('action', action)

    if (vehicle) {
        formData.append('vehicleData', JSON.stringify(vehicle))
    }

    const response = await fetch('/api/ebay-listings', {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || `Failed to ${action} listing`)
    }

    return response.json()
}
