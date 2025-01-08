import { NextResponse } from 'next/server'
// For App Router, we use runtime configuration
export const runtime = 'nodejs' // Enable Node.js runtime
export const dynamic = 'force-dynamic' // Disable static optimization
export const maxDuration = 300 // Set maximum duration to 5 minutes
import { getMyEbayListings } from '../../../lib/ebay/get-listings'
import { verifyEbayListing } from '../../../lib/ebay/verify-listing'
import { addEbayListing } from '../../../lib/ebay/add-listing'
import { getCategoryFeatures } from '../../../lib/ebay/get-category-features'
import { auth } from '@clerk/nextjs'
import { EbayListing } from '../../../lib/ebay/types'

// Helper function to read request body as stream
async function readStream(req: Request): Promise<FormData> {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        try {
            return await req.formData()
        } catch (error) {
            console.error('Error reading form data:', error)
            throw new Error('Failed to parse form data')
        }
    }
    throw new Error('Invalid content type')
}

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
    const startTime = Date.now()
    // console.log('Starting POST request processing')
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // console.log('Reading form data from request stream...')
        const formData = await readStream(req)
        // console.log('Form data read successfully')
        const isVerification = formData.get('action') === 'verify'
        // console.log(
        //     `Request type: ${
        //         isVerification ? 'Verification' : 'Listing creation'
        //     }`
        // )

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const priceStr = formData.get('price') as string
        const price = parseFloat(priceStr)
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
        const allowOffers = formData.get('allowOffers') === 'true'
        const minimumOfferPriceStr = formData.get('minimumOfferPrice') as string
        const minimumOfferPrice = minimumOfferPriceStr
            ? parseFloat(minimumOfferPriceStr)
            : undefined

        if (allowOffers && minimumOfferPrice) {
            const categoryFeatures = await getCategoryFeatures(category)
            if (!categoryFeatures.bestOfferAutoDeclineEnabled) {
                return NextResponse.json(
                    {
                        error: 'Category does not support auto-decline for Best Offers',
                        details:
                            'The minimum offer price feature is not available for this category.',
                    },
                    { status: 400 }
                )
            }
        }

        const vehicleDataStr = formData.get('vehicleData') as string
        const vehicle = vehicleDataStr ? JSON.parse(vehicleDataStr) : null

        const productionYearData = productionYearInfo
            ? JSON.parse(productionYearInfo)
            : null

        if (
            !title ||
            !description ||
            isNaN(price) ||
            !condition ||
            !category ||
            !shippingProfileId
        ) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const imageUrlsStr = formData.get('imageUrls') as string
        if (!imageUrlsStr) {
            return NextResponse.json(
                { error: 'At least one photo URL is required' },
                { status: 400 }
            )
        }

        const imageUrls = JSON.parse(imageUrlsStr)
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or empty photo URLs' },
                { status: 400 }
            )
        }

        const listingParams = {
            title,
            description: title,
            compatibility: productionYearData?.description || '',
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
            allowOffers,
            minimumOfferPrice,
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
            // console.log('Starting eBay listing verification')
            const verificationResult = await verifyEbayListing(listingParams)
            const processingTime = Date.now() - startTime
            // console.log('Verification complete')
            return NextResponse.json({
                success: true,
                message: 'Listing verified successfully',
                verificationResult,
            })
        } else {
            const enableEbayListing = process.env.ENABLE_EBAY_LISTING === 'true'

            if (!enableEbayListing) {
                return NextResponse.json({
                    success: true,
                    message:
                        'Test Mode: Listing simulated successfully (eBay listing disabled)',
                    itemId: 'SIMULATION-' + Date.now(),
                    testMode: true,
                })
            }

            const result = await addEbayListing(listingParams)

            return NextResponse.json({
                success: true,
                message: 'Listing submitted successfully to eBay',
                itemId: result.itemId,
                testMode: false,
            })
        }
    } catch (error: any) {
        // console.error('Error processing eBay listing:', error)
        // console.error('Stack trace:', error.stack)
        return NextResponse.json(
            {
                error: 'Failed to process eBay listing',
                details: error.message,
            },
            { status: 500 }
        )
    }
}
