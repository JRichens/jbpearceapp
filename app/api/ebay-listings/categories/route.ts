import { NextResponse } from 'next/server'
import { getEbayCategories } from '@/lib/ebay/get-categories'
import { auth } from '@clerk/nextjs'

// Runtime and dynamic configuration
export const runtime = 'nodejs' // Enable Node.js runtime
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { userId } = auth()

        if (!userId) {
            console.error('Unauthorized: No user ID found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get search term and useVehicleSearch flag from URL params
        const { searchParams } = new URL(request.url)
        const searchTerm = searchParams.get('search')
        const useVehicleSearch = searchParams.get('useVehicleSearch') === 'true'

        console.log('API: Fetching categories with search term:', searchTerm)
        console.log('API: Using vehicle search:', useVehicleSearch)

        const categories = await getEbayCategories(
            searchTerm || undefined,
            useVehicleSearch
        )
        console.log('API: Categories fetched:', categories.length)

        // Validate the response
        if (!Array.isArray(categories)) {
            console.error('API: Invalid categories response:', categories)
            return NextResponse.json(
                { error: 'Invalid categories response' },
                { status: 500 }
            )
        }

        // Determine if these are fallback categories (more than 3 categories with useVehicleSearch=true)
        const isFallbackCategories = useVehicleSearch && categories.length > 3

        // Limit the number of categories if needed
        // For fallback categories, return all of them for scrollable display
        const MAX_CATEGORIES = isFallbackCategories
            ? 100
            : useVehicleSearch
            ? 3
            : 100
        const limitedCategories = categories.slice(0, MAX_CATEGORIES)
        console.log('API: Returning categories:', limitedCategories.length)
        console.log('API: Using fallback categories:', isFallbackCategories)

        return NextResponse.json(limitedCategories, {
            status: 200,
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
            },
        })
    } catch (error: any) {
        console.error('Error in eBay categories API route:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch eBay categories',
                details: error.message,
            },
            { status: 500 }
        )
    }
}
