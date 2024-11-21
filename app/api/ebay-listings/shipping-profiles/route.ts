import { NextResponse } from 'next/server'
import { getShippingProfiles } from '@/lib/ebay/shipping-profiles'

export async function GET() {
    try {
        const profiles = await getShippingProfiles()
        return NextResponse.json(profiles)
    } catch (error) {
        console.error('Error fetching shipping profiles:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shipping profiles' },
            { status: 500 }
        )
    }
}
