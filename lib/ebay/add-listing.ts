import { CreateListingParams } from './types'
import { getConditionId, getElementText } from './utils'
import * as fs from 'fs'
import * as path from 'path'

// <ItemCompatibilityList>
//                     <Compatibility>
//                         <NameValueList>
//                             <Name>Cars Year</Name>
//                             <Value>2012</Value>
//                         </NameValueList>
//                         <NameValueList>
//                             <Name>Car Make</Name>
//                             <Value>BMW</Value>
//                         </NameValueList>
//                         <NameValueList>
//                             <Name>Model</Name>
//                             <Value>F20</Value>
//                         </NameValueList>
//                         <CompatibilityNotes>Fits for all trims and engines.</CompatibilityNotes>
//                     </Compatibility>
//                 </ItemCompatibilityList>

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

export async function addEbayListing(
    params: CreateListingParams
): Promise<{ itemId: string }> {
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
        } = params

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

        if (paintCode) {
            itemSpecifics.push(`
                <NameValueList>
                    <Name>Paint Code</Name>
                    <Value>${escapeXml(paintCode)}</Value>
                </NameValueList>`)
        }

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
            if (vehicle.colourCurrent) {
                itemSpecifics.push(`
                    <NameValueList>
                        <Name>Colour</Name>
                        <Value>${escapeXml(vehicle.colourCurrent)}</Value>
                    </NameValueList>`)
            }
        }

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
                <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
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
                        <VATDetails>
                            <VATPercent>20</VATPercent>
                        </VATDetails>
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
                </AddFixedPriceItemRequest>`

        // console.log(requestXml)

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '1227',
                'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
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

            if (severityCode === 'Error') {
                const errorCode = getElementText(error, 'ErrorCode')
                const errorMessage = getElementText(error, 'LongMessage')
                console.error('eBay API Error:', { errorCode, errorMessage })
                throw new Error(errorMessage || 'Failed to add listing')
            }
        }

        // Get the item ID from the response
        const itemId = getElementText(xmlDoc, 'ItemID')
        if (!itemId) {
            throw new Error('No item ID returned from eBay')
        }

        return { itemId }
    } catch (error) {
        console.error('Error in addEbayListing:', error)
        throw error
    }
}
