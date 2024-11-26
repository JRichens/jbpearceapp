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
            (listing: EbayListing) => (listing.watchCount ?? 0) >= 3
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
        const partNumber = formData.get('partNumber') as string
        const brand = formData.get('brand') as string
        const make = formData.get('make') as string
        const paintCode = formData.get('paintCode') as string
        const placement = formData.get('placement') as string
        const productionYearInfo = formData.get('productionYearInfo') as string

        // Get vehicle data for hidden fields
        const vehicleDataStr = formData.get('vehicleData') as string
        const vehicle = vehicleDataStr ? JSON.parse(vehicleDataStr) : null

        // Parse production year info
        const productionYearData = productionYearInfo
            ? JSON.parse(productionYearInfo)
            : null

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
            description: title, // Use title as the description
            compatibility: productionYearData?.description || '', // Use production year info description as compatibility
            price,
            condition,
            conditionDescription,
            imageUrls,
            currency,
            quantity: quantity ? parseInt(quantity, 10) : 1,
            category,
            shippingProfileId,
            location: 'Bristol',
            partNumber: partNumber || undefined,
            brand: brand || undefined,
            make: make || undefined,
            paintCode: paintCode || undefined,
            placement: placement || undefined,
            vehicle: vehicle
                ? {
                      vinOriginalDvla: vehicle.vinOriginalDvla,
                      dvlaYearOfManufacture: vehicle.dvlaYearOfManufacture,
                      dvlaModel: vehicle.dvlaModel,
                      dvlaMake: vehicle.dvlaMake,
                      modelSeries: vehicle.modelSeries,
                      modelVariant: vehicle.modelVariant,
                      colourCurrent: vehicle.colourCurrent,
                      engineCode: vehicle.engineCode,
                      engineCapacity: vehicle.engineCapacity,
                      fuelType: vehicle.fuelType,
                      transmission: vehicle.transmission,
                      driveType: vehicle.driveType,
                      euroStatus: vehicle.euroStatus,
                  }
                : undefined,
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
            // Check if eBay listing is enabled
            const enableEbayListing = process.env.ENABLE_EBAY_LISTING === 'true'

            if (!enableEbayListing) {
                console.log(
                    'eBay listing is disabled. Simulating successful listing.'
                )
                return NextResponse.json({
                    success: true,
                    message:
                        'Test Mode: Listing simulated successfully (eBay listing disabled)',
                    itemId: 'SIMULATION-' + Date.now(),
                    testMode: true,
                })
            }

            // Submit the listing to eBay only if enabled
            const result = await addEbayListing(listingParams)

            return NextResponse.json({
                success: true,
                message: 'Listing submitted successfully to eBay',
                itemId: result.itemId,
                testMode: false,
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
