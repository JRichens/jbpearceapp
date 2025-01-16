import { CreateListingParams } from './types'
import { getConditionId, getElementText } from './utils'
import * as fs from 'fs'
import * as path from 'path'

interface VerificationResult {
    success: boolean
    fees: {
        insertionFee: string
        totalFees: string
    }
}

interface Spec {
    name: string
    value: string | undefined
    condition: () => boolean
}

export async function verifyEbayListing(
    params: CreateListingParams
): Promise<VerificationResult> {
    try {
        const {
            title,
            description,
            compatibility,
            price,
            condition,
            conditionDescription,
            imageUrls,
            currency = 'GBP',
            quantity = 1,
            category,
            location,
            partNumber,
            brand,
            make,
            placement,
            paintCode,
            vehicle,
            shippingProfileId,
            allowOffers = false,
            minimumOfferPrice,
            // Wheel and tyre fields
            wheelDiameter,
            tyreWidth,
            aspectRatio,
            numberOfStuds,
            centreBore,
            packageQuantity,
            wheelMaterial,
            wheelBrand,
            pcd,
            // Tyre-only fields
            tyreModel,
            treadDepth,
            dotDateCode,
            runFlat,
            unitQty,
        } = params

        // Helper function to escape XML special characters
        const escapeXml = (str: string): string => {
            return str.replace(/[<>&'"]/g, (c: string) => {
                switch (c) {
                    case '<':
                        return '&lt;'
                    case '>':
                        return '&gt;'
                    case '&':
                        // Don't escape &lt; &gt; &amp; &quot; &apos;
                        return /&(?:lt|gt|amp|quot|apos);/i.test(
                            str.slice(str.indexOf(c), str.indexOf(c) + 6)
                        )
                            ? c
                            : '&amp;'
                    case '"':
                        return '&quot;'
                    case "'":
                        return '&apos;'
                    default:
                        return c
                }
            })
        }

        // Helper function to strip spaces and hyphens from part numbers and format multiple numbers
        const formatPartNumbers = (partNum: string): string => {
            // Split by comma, strip spaces/hyphens from each part, then join with comma + space
            return partNum
                .split(',')
                .map((part) => part.trim().replace(/[\s-]/g, ''))
                .join(', ')
        }

        // Read the template file
        const templatePath = path.join(
            process.cwd(),
            'lib/ebay/listing-template.html'
        )
        let template = fs.readFileSync(templatePath, 'utf8')

        // Replace placeholders with actual data
        const replacements = {
            partDescription: title || '',
            compatibility: compatibility || '',
            make: vehicle?.dvlaMake || make || '',
            model: vehicle?.dvlaModel || '',
            year: vehicle?.dvlaYearOfManufacture || '',
            series: vehicle?.modelSeries || '',
            variant: vehicle?.modelVariant || '',
            color: vehicle?.colourCurrent || '',
            engineCode: vehicle?.engineCode || '',
            engineSize: vehicle?.engineCapacity || '',
            fuelType: vehicle?.fuelType || '',
            transmission: vehicle?.transmission || '',
            driveType: vehicle?.driveType || '',
            euroStatus: vehicle?.euroStatus || '',
            partNumber: partNumber || '',
            vin: vehicle?.vinOriginalDvla || '',
            paintCode: paintCode || vehicle?.paintCode || '',
        }

        // Replace all placeholders in the template
        Object.entries(replacements).forEach(([key, value]) => {
            template = template.replace(
                new RegExp(`{{${key}}}`, 'g'),
                escapeXml(value || '')
            )
        })

        // Handle compatibility section visibility
        const compatibilitySection = `
    <section class="section">
        <div class="section-header">
            <h2>
                <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/business-professional-services/services-plumber-icon.png"
                    alt="Compatibility"
                />
                Compatibility Guide
            </h2>
        </div>
        <div class="specs-grid">
            <div class="spec-item" style="display: block">
                <p style="line-height: 1.6">${escapeXml(
                    compatibility || ''
                )}</p>
                <p style="margin-top: 1rem; font-weight: italic">
                    *This is a guide only and is not a guarantee of
                    compatibility
                </p>
            </div>
        </div>
    </section>`

        // Only show compatibility section for non-wheel/tyre categories
        template = template.replace(
            '<div id="compatibility-section-placeholder"></div>',
            category !== '179681' && category !== '179680'
                ? compatibilitySection
                : ''
        )

        // Prepare ItemSpecifics section
        const itemSpecifics = []

        // Only include Make for non-tyre categories
        if (make && category !== '179680') {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Brand</Name>
                    <Value>${escapeXml(make)}</Value>
                </NameValueList>
                <NameValueList>
                    <Name>Make</Name>
                    <Value>${escapeXml(make)}</Value>
                </NameValueList>`)
        }

        if (partNumber) {
            const escapedPartNumber = escapeXml(partNumber)
            const formattedPartNumber = escapeXml(formatPartNumbers(partNumber))
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Manufacturer Part Number</Name>
                    <Value>${escapedPartNumber}</Value>
                </NameValueList>
                <NameValueList>
                    <Name>Reference OE/OEM Number</Name>
                    <Value>${formattedPartNumber}</Value>
                </NameValueList>`)
        }

        // Add placement as a single combined value
        if (placement) {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Placement on Vehicle</Name>
                    <Value>${escapeXml(placement)}</Value>
                </NameValueList>`)
        }

        // Only include Paint Code for non-tyre categories
        if (paintCode && category !== '179680') {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Paint Code</Name>
                    <Value>${escapeXml(paintCode)}</Value>
                </NameValueList>`)
        }

        // Include Number of Items for wheel/tyre categories
        if (
            (category === '179680' && unitQty) ||
            (category === '179681' && packageQuantity)
        ) {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Number of Items</Name>
                    <Value>${escapeXml(
                        (category === '179680' ? unitQty : packageQuantity) ||
                            ''
                    )}</Value>
                </NameValueList>`)
        }

        // Add wheel and tyre specifics if category is wheels/tyres
        if (category === '179681' || category === '179680') {
            if (wheelDiameter && parseFloat(wheelDiameter) > 0) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Wheel Diameter</Name>
                        <Value>${escapeXml(wheelDiameter)}</Value>
                    </NameValueList>`)
            }
            if (tyreWidth && parseFloat(tyreWidth) > 0) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Tyre Width</Name>
                        <Value>${escapeXml(tyreWidth)}</Value>
                    </NameValueList>`)
            }
            if (aspectRatio && parseFloat(aspectRatio) > 0) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Aspect Ratio</Name>
                        <Value>${escapeXml(aspectRatio)}</Value>
                    </NameValueList>`)
            }
            // Add tyre-specific fields for category 179680
            if (category === '179680') {
                const tyreSpecs: Spec[] = [
                    {
                        name: 'Brand',
                        value: brand,
                        condition: () => Boolean(brand && brand.trim() !== ''),
                    },
                    {
                        name: 'Model',
                        value: tyreModel,
                        condition: () =>
                            Boolean(tyreModel && tyreModel.trim() !== ''),
                    },
                    {
                        name: 'Tread Depth',
                        value: treadDepth ? `${treadDepth} mm` : '',
                        condition: () =>
                            Boolean(treadDepth && treadDepth.trim() !== ''),
                    },
                    {
                        name: 'DOT Date Code',
                        value: dotDateCode,
                        condition: () =>
                            Boolean(dotDateCode && dotDateCode.trim() !== ''),
                    },
                    {
                        name: 'Run Flat',
                        value: runFlat,
                        condition: () =>
                            Boolean(runFlat && runFlat.trim() !== ''),
                    },
                    {
                        name: 'Unit Quantity',
                        value: unitQty,
                        condition: () =>
                            Boolean(unitQty && unitQty.trim() !== ''),
                    },
                ]

                tyreSpecs.forEach((spec) => {
                    if (spec.condition()) {
                        itemSpecifics.push(`
                            <NameValueList>
                                <Name>${spec.name}</Name>
                                <Value>${escapeXml(spec.value || '')}</Value>
                            </NameValueList>`)
                    }
                })
            }

            // Optional wheel/tyre specifics for category 179681
            if (category === '179681') {
                const optionalSpecs: Spec[] = [
                    {
                        name: 'Number of Studs',
                        value: numberOfStuds,
                        condition: () =>
                            Boolean(
                                numberOfStuds && parseFloat(numberOfStuds) > 0
                            ),
                    },
                    {
                        name: 'Centre Bore',
                        value: centreBore,
                        condition: () =>
                            Boolean(centreBore && centreBore.trim() !== ''),
                    },
                    {
                        name: 'Wheel Material',
                        value: wheelMaterial,
                        condition: () =>
                            Boolean(
                                wheelMaterial && wheelMaterial.trim() !== ''
                            ),
                    },
                    {
                        name: 'PCD',
                        value: pcd,
                        condition: () => Boolean(pcd && pcd.trim() !== ''),
                    },
                ]

                optionalSpecs.forEach((spec) => {
                    if (spec.condition()) {
                        itemSpecifics.push(`
                            <NameValueList>
                                <Name>${spec.name}</Name>
                                <Value>${escapeXml(spec.value || '')}</Value>
                            </NameValueList>`)
                    }
                })
            }
        }

        // Determine if this is a wheel/tyre category
        const isWheelTyreCategory =
            category === '179681' || category === '179680'

        // Include vehicle details if:
        // 1. For wheel/tyre categories: only when showCarInfo is true
        // 2. For other categories: always include when vehicle data exists
        const shouldIncludeVehicleDetails = isWheelTyreCategory
            ? vehicle && params.showCarInfo
            : Boolean(vehicle)

        if (shouldIncludeVehicleDetails && vehicle) {
            // Add vehicle-specific item specifics
            const vehicleSpecs = [
                {
                    name: 'Vehicle Identification Number (VIN)',
                    value: vehicle.vinOriginalDvla,
                },
                {
                    name: 'Year',
                    value: vehicle.dvlaYearOfManufacture,
                },
                {
                    name: 'Model',
                    value: vehicle.dvlaModel,
                },
                {
                    name: 'Colour',
                    value: vehicle.colourCurrent,
                },
            ]

            vehicleSpecs.forEach((spec) => {
                if (spec.value) {
                    itemSpecifics.push(`
                    <NameValueList>
                        <Name>${spec.name}</Name>
                        <Value>${escapeXml(spec.value)}</Value>
                    </NameValueList>`)
                }
            })
        }

        // Define wheel/tyre details section for category 179681
        const wheelTyreSection =
            category === '179681'
                ? `
    <section class="section wheel-tyre-details">
        <div class="section-header">
            <h2>
                <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/transportation-automotive/wheel-icon.png"
                    alt="Wheel"
                />
                Wheel & Tyre Details
            </h2>
        </div>
        <div class="specs-grid">
            <div class="spec-item">
                <span class="spec-label">Wheel Diameter</span>
                <span class="spec-value">${escapeXml(
                    wheelDiameter || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Tyre Width</span>
                <span class="spec-value">${escapeXml(tyreWidth || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Aspect Ratio</span>
                <span class="spec-value">${escapeXml(aspectRatio || '')}</span>
            </div>
            ${
                numberOfStuds
                    ? `
            <div class="spec-item">
                <span class="spec-label">Number of Studs</span>
                <span class="spec-value">${escapeXml(numberOfStuds)}</span>
            </div>`
                    : ''
            }
            ${
                centreBore
                    ? `
            <div class="spec-item">
                <span class="spec-label">Centre Bore</span>
                <span class="spec-value">${escapeXml(centreBore)}</span>
            </div>`
                    : ''
            }
            <div class="spec-item">
                <span class="spec-label">Number of Items</span>
                <span class="spec-value">${escapeXml(
                    packageQuantity || ''
                )}</span>
            </div>
            ${
                wheelMaterial
                    ? `
            <div class="spec-item">
                <span class="spec-label">Wheel Material</span>
                <span class="spec-value">${escapeXml(wheelMaterial)}</span>
            </div>`
                    : ''
            }
            ${
                wheelBrand
                    ? `
            <div class="spec-item">
                <span class="spec-label">Wheel Brand</span>
                <span class="spec-value">${escapeXml(wheelBrand)}</span>
            </div>`
                    : ''
            }
            ${
                pcd
                    ? `
            <div class="spec-item">
                <span class="spec-label">PCD</span>
                <span class="spec-value">${escapeXml(pcd)}</span>
            </div>`
                    : ''
            }
        </div>
    </section>`
                : ''

        // Define tyre-only details section for category 179680
        const tyreSection =
            category === '179680'
                ? `
    <section class="section tyre-details">
        <div class="section-header">
            <h2>
                <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/transportation-automotive/wheel-icon.png"
                    alt="Tyre"
                />
                Tyre Details
            </h2>
        </div>
        <div class="specs-grid">
            <div class="spec-item">
                <span class="spec-label">Brand</span>
                <span class="spec-value">${escapeXml(brand || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Model</span>
                <span class="spec-value">${escapeXml(tyreModel || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Tread Depth</span>
                <span class="spec-value">${escapeXml(
                    treadDepth || ''
                )} mm</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">DOT Date Code</span>
                <span class="spec-value">${escapeXml(dotDateCode || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Run Flat</span>
                <span class="spec-value">${escapeXml(runFlat || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Rim Diameter</span>
                <span class="spec-value">${escapeXml(
                    wheelDiameter || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Tyre Width</span>
                <span class="spec-value">${escapeXml(tyreWidth || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Aspect Ratio</span>
                <span class="spec-value">${escapeXml(aspectRatio || '')}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Number of Items</span>
                <span class="spec-value">${escapeXml(unitQty || '')}</span>
            </div>
        </div>
    </section>`
                : ''

        // Handle vehicle details section visibility
        const vehicleDetailsSection = `
    <section class="section vehicle-details">
        <div class="section-header">
            <h2>
                <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/transportation-automotive/car-icon.png"
                    alt="Vehicle"
                />
                Vehicle Details
            </h2>
        </div>
        <div class="specs-grid">
            <div class="spec-item">
                <span class="spec-label">Make</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.dvlaMake || make || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Model</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.dvlaModel || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Year</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.dvlaYearOfManufacture || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Series</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.modelSeries || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Variant</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.modelVariant || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Color</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.colourCurrent || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Engine Code</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.engineCode || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Engine Size</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.engineCapacity || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Fuel Type</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.fuelType || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Transmission</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.transmission || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Drive Type</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.driveType || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Euro Status</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.euroStatus || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">VIN</span>
                <span class="spec-value">${escapeXml(
                    vehicle?.vinOriginalDvla || ''
                )}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Paint Code</span>
                <span class="spec-value">${escapeXml(
                    paintCode || vehicle?.paintCode || ''
                )}</span>
            </div>
        </div>
    </section>`

        // For wheel/tyre categories, we'll move the vehicle details section after the respective details
        if (isWheelTyreCategory) {
            // First remove the original placeholder
            template = template.replace(
                '<div id="vehicle-details-placeholder"></div>',
                ''
            )

            // Then append vehicle details after wheel/tyre details if needed
            if (category === '179681') {
                template = template.replace(
                    '<div id="wheel-tyre-details-placeholder"></div>',
                    `${wheelDiameter ? wheelTyreSection : ''}${
                        shouldIncludeVehicleDetails ? vehicleDetailsSection : ''
                    }`
                )
            } else {
                template = template.replace(
                    '<div id="tyre-details-placeholder"></div>',
                    `${tyreSection}${
                        shouldIncludeVehicleDetails ? vehicleDetailsSection : ''
                    }`
                )
            }
        } else {
            // For normal categories, use the original placeholder
            template = template.replace(
                '<div id="vehicle-details-placeholder"></div>',
                shouldIncludeVehicleDetails ? vehicleDetailsSection : ''
            )
        }

        // Replace any remaining placeholders
        template = template.replace(
            '<div id="wheel-tyre-details-placeholder"></div>',
            category === '179681' && wheelDiameter ? wheelTyreSection : ''
        )
        template = template.replace(
            '<div id="tyre-details-placeholder"></div>',
            category === '179680' ? tyreSection : ''
        )

        itemSpecifics.push(`
            <NameValueList>
                <Name>Warranty Period</Name>
                <Value>See warranty period for details</Value>
            </NameValueList>`)

        // Wrap the template in CDATA to preserve HTML
        const wrappedDescription = `<![CDATA[${template}]]>`

        // Get shipping profile name based on ID
        const shippingProfileName =
            shippingProfileId === '241635992017'
                ? 'Courier 3-5 Work/Days'
                : 'Express Delivery'

        // Prepare BestOfferDetails and ListingDetails XML
        const bestOfferDetailsXml = allowOffers
            ? `<BestOfferDetails>
                <BestOfferEnabled>true</BestOfferEnabled>
               </BestOfferDetails>`
            : ''

        const listingDetailsXml =
            allowOffers && minimumOfferPrice
                ? `<ListingDetails>
                <MinimumBestOfferPrice>${minimumOfferPrice}</MinimumBestOfferPrice>
                <BestOfferAutoAcceptPrice>${minimumOfferPrice}</BestOfferAutoAcceptPrice>
               </ListingDetails>`
                : ''

        const requestXml = `<?xml version="1.0" encoding="utf-8"?>
                <VerifyAddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                    <RequesterCredentials>
                        <eBayAuthToken>${
                            process.env.EBAY_USER_TOKEN
                        }</eBayAuthToken>
                    </RequesterCredentials>
                    <ErrorLanguage>en_GB</ErrorLanguage>
                    <WarningLevel>High</WarningLevel>
                    <Item>
                        <Title>${escapeXml(title)}</Title>
                        <Description>${wrappedDescription}</Description>
                        <PrimaryCategory>
                            <CategoryID>${category.trim()}</CategoryID>
                        </PrimaryCategory>
                        <StartPrice>${price}</StartPrice>
                        <ConditionID>${getConditionId(condition)}</ConditionID>
                        ${
                            conditionDescription
                                ? `<ConditionDescription>${escapeXml(
                                      conditionDescription
                                  )}</ConditionDescription>`
                                : ''
                        }
                        <ItemSpecifics>${itemSpecifics.join('')}</ItemSpecifics>
                        <Country>GB</Country>
                        <Currency>${currency}</Currency>
                        <DispatchTimeMax>3</DispatchTimeMax>
                        <ListingDuration>GTC</ListingDuration>
                        <ListingType>FixedPriceItem</ListingType>
                        <Location>${escapeXml(location)}</Location>
                        <PaymentMethods>PayPal</PaymentMethods>
                        <PayPalEmailAddress>${
                            process.env.PAYPAL_EMAIL
                        }</PayPalEmailAddress>
                        <PictureDetails>
                            ${imageUrls
                                .filter((url) => url && url.trim() !== '')
                                .map(
                                    (url) =>
                                        `<PictureURL>${escapeXml(
                                            url
                                        )}</PictureURL>`
                                )
                                .join('')}
                        </PictureDetails>
                        <Quantity>${quantity}</Quantity>
                        ${bestOfferDetailsXml}
                        ${listingDetailsXml}
                        <SellerProfiles>
                            <SellerPaymentProfile>
                                <PaymentProfileID>239472522017</PaymentProfileID>
                                <PaymentProfileName>eBay Managed Payments (239472522017)</PaymentProfileName>
                            </SellerPaymentProfile>
                            <SellerReturnProfile>
                                <ReturnProfileID>239472521017</ReturnProfileID>
                                <ReturnProfileName>14 days (239472521017)</ReturnProfileName>
                            </SellerReturnProfile>
                            <SellerShippingProfile>
                                <ShippingProfileID>${
                                    shippingProfileId || '240049979017'
                                }</ShippingProfileID>
                                <ShippingProfileName>${shippingProfileName}</ShippingProfileName>
                            </SellerShippingProfile>
                        </SellerProfiles>
                    </Item>
                </VerifyAddFixedPriceItemRequest>`

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'VerifyAddFixedPriceItem',
                'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                'Content-Type': 'text/xml',
            },
            body: requestXml,
        })

        const responseText = await response.text()

        if (!response.ok) {
            throw new Error(`eBay API error: ${response.statusText}`)
        }

        const { DOMParser } = require('@xmldom/xmldom')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(responseText, 'text/xml')

        // Check for any errors
        const errors = xmlDoc.getElementsByTagName('Errors')
        for (let i = 0; i < errors.length; i++) {
            const error = errors[i]
            const severityCode = getElementText(error, 'SeverityCode')

            // Only throw error for Error severity, not Warning
            if (severityCode === 'Error') {
                const errorCode = getElementText(error, 'ErrorCode')
                const errorMessage = getElementText(error, 'LongMessage')
                throw new Error(errorMessage || 'Verification failed')
            }
        }

        // Extract fees
        const fees = xmlDoc.getElementsByTagName('Fee')
        let insertionFee = '0.00'
        let totalFees = 0

        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i]
            const name = getElementText(fee, 'Name')
            const amount = parseFloat(getElementText(fee, 'Fee') || '0')

            if (name === 'InsertionFee') {
                insertionFee = amount.toFixed(2)
                totalFees += amount
            }
        }

        return {
            success: true,
            fees: {
                insertionFee,
                totalFees: totalFees.toFixed(2),
            },
        }
    } catch (error) {
        console.error('Error in verifyEbayListing:', error)
        throw error
    }
}
