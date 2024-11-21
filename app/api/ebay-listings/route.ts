import { NextResponse } from 'next/server'
import { getMyEbayListings } from '../../../lib/ebay/get-listings'
import { verifyEbayListing } from '../../../lib/ebay/verify-listing'
import { addEbayListing } from '../../../lib/ebay/add-listing'
import { auth } from '@clerk/nextjs'
import { UTApi } from 'uploadthing/server'
import { EbayListing } from '../../../lib/ebay/types'

// Initialize the UploadThing API
const utapi = new UTApi()

export async function GET() {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const listings = await getMyEbayListings()
        const filteredListings = listings.filter(
            (listing: EbayListing) => listing.watchCount >= 3
        )
        return NextResponse.json(filteredListings)
    } catch (error: any) {
        console.error('Error in eBay listings API route:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch eBay listings',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse the incoming request data
        const formData = await req.formData()

        // Check if this is a verification or submission request
        const isVerification = formData.get('action') === 'verify'

        // Extract listing details
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const price = formData.get('price') as string
        const condition = formData.get('condition') as string
        const conditionDescription = formData.get(
            'conditionDescription'
        ) as string
        const quantity = formData.get('quantity') as string
        const category = formData.get('category') as string
        const shippingProfileId = formData.get('shippingProfileId') as string
        const currency = (formData.get('currency') as string) || 'GBP'

        // Validate required fields
        if (
            !title ||
            !description ||
            !price ||
            !condition ||
            !category ||
            !shippingProfileId
        ) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Handle photo files
        const photos = formData.getAll('photos') as File[]
        if (photos.length === 0) {
            return NextResponse.json(
                { error: 'At least one photo is required' },
                { status: 400 }
            )
        }

        // Upload photos to UploadThing
        const uploadPromises = photos.map(async (photo) => {
            const response = await utapi.uploadFiles(photo)
            return {
                url: response.data?.url,
                key: response.data?.key,
            }
        })

        const uploadResults = await Promise.all(uploadPromises)

        // Filter out any undefined values and ensure we have at least one valid image URL
        const imageData = uploadResults.filter(
            (result): result is { url: string; key: string } =>
                result.url !== undefined && result.key !== undefined
        )

        if (imageData.length === 0) {
            return NextResponse.json(
                { error: 'Failed to upload photos' },
                { status: 500 }
            )
        }

        const imageUrls = imageData.map((data) => data.url)

        const listingParams = {
            title,
            description,
            price,
            condition,
            conditionDescription,
            imageUrls,
            currency,
            quantity: quantity ? parseInt(quantity, 10) : 1,
            category,
            shippingProfileId,
            location: 'Bristol',
        }

        if (isVerification) {
            // Verify the eBay listing
            const verificationResult = await verifyEbayListing(listingParams)
            return NextResponse.json({
                success: true,
                message: 'Listing verified successfully',
                verificationResult,
            })
        } else {
            // Submit the listing to eBay
            const result = await addEbayListing(listingParams)

            // Store the image keys in the database or a file for later cleanup
            // This is a better approach than immediate deletion
            // You might want to implement a separate cleanup job that runs periodically
            // to delete old images after ensuring they're properly processed by eBay

            return NextResponse.json({
                success: true,
                message: 'Listing submitted successfully',
                itemId: result.itemId,
            })
        }
    } catch (error: any) {
        console.error('Error processing eBay listing:', error)
        return NextResponse.json(
            {
                error: 'Failed to process eBay listing',
                details: error.message,
            },
            { status: 500 }
        )
    }
}
