import { NextResponse } from 'next/server'
import { compareEbayListings } from '@/lib/ebay/compare-listings'
import { auth } from '@clerk/nextjs'

interface ComparisonResult {
    missingFields: string[]
    differentValues: Array<{
        field: string
        api: string
        manual: string
    }>
    apiListing: Record<string, any>
    manualListing: Record<string, any>
}

interface FormattedResponse {
    summary: {
        totalMissingFields: number
        totalDifferences: number
    }
    missingFields: Array<{
        field: string
        manualValue: any
    }>
    differences: Array<{
        field: string
        api: string
        manual: string
    }>
    recommendations: string[]
    details: {
        apiListing: Record<string, any>
        manualListing: Record<string, any>
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get listing IDs from URL params
        const { searchParams } = new URL(request.url)
        const apiListingId = searchParams.get('apiListingId')
        const manualListingId = searchParams.get('manualListingId')

        if (!apiListingId || !manualListingId) {
            return NextResponse.json(
                { error: 'Both apiListingId and manualListingId are required' },
                { status: 400 }
            )
        }

        const comparison = await compareEbayListings(
            apiListingId,
            manualListingId
        )

        // Format the response for better readability
        const response: FormattedResponse = {
            summary: {
                totalMissingFields: comparison.missingFields.length,
                totalDifferences: comparison.differentValues.length,
            },
            missingFields: comparison.missingFields.map((field) => ({
                field,
                manualValue: getNestedValue(comparison.manualListing, field),
            })),
            differences: comparison.differentValues,
            recommendations: generateRecommendations(comparison),
            details: {
                apiListing: comparison.apiListing,
                manualListing: comparison.manualListing,
            },
        }

        return NextResponse.json(response)
    } catch (error: any) {
        console.error('Error comparing eBay listings:', error)
        return NextResponse.json(
            {
                error: 'Failed to compare eBay listings',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

// Helper function to get nested object values using dot notation
function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null
    }, obj)
}

// Helper function to generate recommendations based on the comparison
function generateRecommendations(comparison: ComparisonResult): string[] {
    const recommendations: string[] = []

    // Check for common important missing fields
    if (comparison.missingFields.includes('itemSpecifics')) {
        recommendations.push(
            'Add Item Specifics to provide more details about your item'
        )
    }
    if (
        comparison.missingFields.some((field: string) =>
            field.includes('shipping')
        )
    ) {
        recommendations.push(
            'Include detailed shipping information in your listing'
        )
    }
    if (
        comparison.missingFields.some((field: string) =>
            field.includes('return')
        )
    ) {
        recommendations.push('Add return policy details to your listing')
    }
    if (
        comparison.missingFields.some((field: string) =>
            field.includes('condition')
        )
    ) {
        recommendations.push('Provide more detailed condition information')
    }

    // Add general recommendations
    recommendations.push(
        'Consider updating your listing template to include all fields found in manual listings'
    )
    recommendations.push(
        'Review the manual listing structure to identify important missing details'
    )

    return recommendations
}
