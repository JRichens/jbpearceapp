import { NextResponse } from 'next/server'
import { getEbayCategories } from '@/lib/ebay/get-categories'
import { auth } from '@clerk/nextjs'

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

        // Limit the number of categories if needed
        const MAX_CATEGORIES = useVehicleSearch ? 3 : 100
        const limitedCategories = categories.slice(0, MAX_CATEGORIES)
        console.log('API: Returning categories:', limitedCategories.length)

        // Set appropriate headers
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0',
        })

        return new NextResponse(JSON.stringify(limitedCategories), {
            status: 200,
            headers,
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
