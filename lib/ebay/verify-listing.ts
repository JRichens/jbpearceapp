import { CreateListingParams } from './types'
import { getConditionId, getElementText } from './utils'

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
            price,
            condition,
            conditionDescription,
            imageUrls,
            currency = 'GBP',
            quantity = 1,
            category,
            location,
        } = params

        // Validate category
        if (!category) {
            throw new Error('Category ID is required')
        }

        if (!/^\d+$/.test(category)) {
            throw new Error(
                `Invalid category ID format: ${category}. Must be a numeric value.`
            )
        }

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
                        <Title>${title}</Title>
                        <Description>${description}</Description>
                        <PrimaryCategory>
                            <CategoryID>${category.trim()}</CategoryID>
                        </PrimaryCategory>
                        <StartPrice>${price}</StartPrice>
                        <ConditionID>${getConditionId(condition)}</ConditionID>
                        ${
                            conditionDescription
                                ? `<ConditionDescription>${conditionDescription}</ConditionDescription>`
                                : ''
                        }
                        <Country>GB</Country>
                        <Currency>${currency}</Currency>
                        <DispatchTimeMax>3</DispatchTimeMax>
                        <ListingDuration>GTC</ListingDuration>
                        <ListingType>FixedPriceItem</ListingType>
                        <Location>${location}</Location>
                        <PaymentMethods>PayPal</PaymentMethods>
                        <PayPalEmailAddress>${
                            process.env.PAYPAL_EMAIL
                        }</PayPalEmailAddress>
                        <PictureDetails>
                            ${imageUrls
                                .map((url) => `<PictureURL>${url}</PictureURL>`)
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
                                <ShippingProfileID>240049979017</ShippingProfileID>
                                <ShippingProfileName>Express Delivery</ShippingProfileName>
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
