import { NextResponse } from 'next/server'
import { getMyEbayListings } from '../../../lib/ebay/get-listings'
import { verifyEbayListing } from '../../../lib/ebay/verify-listing'
import { addEbayListing } from '../../../lib/ebay/add-listing'
import { getCategoryFeatures } from '../../../lib/ebay/get-category-features'
import { auth } from '@clerk/nextjs'
import { UTApi } from 'uploadthing/server'
import { EbayListing } from '../../../lib/ebay/types'

const utapi = new UTApi()

// Set a longer timeout for handling multiple high-res images (30 minutes)
const UPLOAD_TIMEOUT = 30 * 60 * 1000

// Helper function to handle file upload with timeout and retry
async function uploadFileWithTimeout(
    photo: File,
    retryCount = 3
): Promise<any> {
    const attemptUpload = async (attempts: number): Promise<any> => {
        try {
            return await Promise.race([
                utapi.uploadFiles(photo),
                new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Upload timeout')),
                        UPLOAD_TIMEOUT
                    )
                ),
            ])
        } catch (error) {
            if (
                attempts > 0 &&
                error instanceof Error &&
                error.message === 'Upload timeout'
            ) {
                console.log(
                    `Retrying upload, ${attempts} attempts remaining...`
                )
                return attemptUpload(attempts - 1)
            }
            throw error
        }
    }

    return attemptUpload(retryCount)
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
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const isVerification = formData.get('action') === 'verify'

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

        const photos = formData.getAll('photos') as File[]
        if (photos.length === 0) {
            return NextResponse.json(
                { error: 'At least one photo is required' },
                { status: 400 }
            )
        }

        // Upload photos with timeout handling and retries
        const uploadResults = await Promise.allSettled(
            photos.map(async (photo, index) => {
                try {
                    console.log(
                        `Starting upload for photo ${index + 1}/${
                            photos.length
                        }`
                    )
                    const result = await uploadFileWithTimeout(photo)
                    if (!result.data) {
                        throw new Error(
                            result.error?.message || 'Upload failed'
                        )
                    }
                    console.log(
                        `Successfully uploaded photo ${index + 1}/${
                            photos.length
                        }`
                    )
                    return {
                        url: result.data.url,
                        key: result.data.key,
                    }
                } catch (error) {
                    console.error(
                        `Failed to upload photo ${index + 1}/${photos.length}:`,
                        error
                    )
                    throw new Error(
                        error instanceof Error ? error.message : 'Upload failed'
                    )
                }
            })
        )

        // Filter successful uploads and handle failures
        const successfulUploads = uploadResults.filter(
            (
                result
            ): result is PromiseFulfilledResult<{
                url: string
                key: string
            }> => result.status === 'fulfilled'
        )

        const failedUploads = uploadResults.filter(
            (result): result is PromiseRejectedResult =>
                result.status === 'rejected'
        )

        if (successfulUploads.length === 0) {
            return NextResponse.json(
                {
                    error: 'Failed to upload photos',
                    details: failedUploads.map((result) => result.reason),
                },
                { status: 500 }
            )
        }

        // If some uploads failed but we have at least one success, we can proceed
        if (failedUploads.length > 0) {
            console.warn(
                `${failedUploads.length} photo uploads failed, proceeding with ${successfulUploads.length} successful uploads`
            )
        }

        const imageUrls = successfulUploads.map((result) => result.value.url)

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
            const verificationResult = await verifyEbayListing(listingParams)
            const processingTime = Date.now() - startTime
            return NextResponse.json({
                success: true,
                message: 'Listing verified successfully',
                verificationResult,
                uploadStats: {
                    successful: successfulUploads.length,
                    failed: failedUploads.length,
                    processingTimeMs: processingTime,
                    processingTimeFormatted: `${(processingTime / 1000).toFixed(
                        2
                    )} seconds`,
                },
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
