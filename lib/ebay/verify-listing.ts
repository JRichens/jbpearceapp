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

        // Read the template file
        const templatePath = path.join(
            process.cwd(),
            'lib/ebay/listing-template.html'
        )
        let template = fs.readFileSync(templatePath, 'utf8')

        // Replace placeholders with actual data
        const replacements = {
            partDescription: title || '', // Use title as partDescription
            compatibility: compatibility || '', // Use provided compatibility
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
        }

        // Replace all placeholders in the template
        Object.entries(replacements).forEach(([key, value]) => {
            template = template.replace(
                new RegExp(`{{${key}}}`, 'g'),
                escapeXml(value || '') // Ensure value is never undefined
            )
        })

        // Validate category
        if (!category) {
            throw new Error('Category ID is required')
        }

        if (!/^\d+$/.test(category)) {
            throw new Error(
                `Invalid category ID format: ${category}. Must be a numeric value.`
            )
        }

        // Prepare ItemSpecifics section
        const itemSpecifics = []

        if (make) {
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

        // Add part number specifics
        if (partNumber) {
            const escapedPartNumber = escapeXml(partNumber)
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Manufacturer Part Number</Name>
                    <Value>${escapedPartNumber}</Value>
                </NameValueList>
                <NameValueList>
                    <Name>Reference OE/OEM Number</Name>
                    <Value>${escapedPartNumber}</Value>
                </NameValueList>`)
        }

        // Add placement specific if provided
        if (placement) {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Placement on Vehicle</Name>
                    <Value>${escapeXml(placement)}</Value>
                </NameValueList>`)
        }

        // Add paint code specific if provided
        if (paintCode) {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Paint Code</Name>
                    <Value>${escapeXml(paintCode)}</Value>
                </NameValueList>`)
        }

        // Add vehicle-related specifics
        if (vehicle) {
            if (vehicle.vinOriginalDvla) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Vehicle Identification Number (VIN)</Name>
                        <Value>${escapeXml(vehicle.vinOriginalDvla)}</Value>
                    </NameValueList>`)
            }
            if (vehicle.dvlaYearOfManufacture) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Year</Name>
                        <Value>${escapeXml(
                            vehicle.dvlaYearOfManufacture
                        )}</Value>
                    </NameValueList>`)
            }
            if (vehicle.dvlaModel) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Model</Name>
                        <Value>${escapeXml(vehicle.dvlaModel)}</Value>
                    </NameValueList>`)
            }
        }

        // Add warranty period specific
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

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3', // UK Site ID
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'VerifyAddFixedPriceItem',
                'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
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
                                .map(
                                    (url) =>
                                        `<PictureURL>${escapeXml(
                                            url
                                        )}</PictureURL>`
                                )
                                .join('')}
                        </PictureDetails>
                        <Quantity>${quantity}</Quantity>
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
                </VerifyAddFixedPriceItemRequest>`,
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
                console.error('eBay API Error:', { errorCode, errorMessage })
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
