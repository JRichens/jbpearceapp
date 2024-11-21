import { CreateListingParams } from './types'
import { getConditionId, getElementText } from './utils'

export async function addEbayListing(
    params: CreateListingParams
): Promise<{ itemId: string }> {
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

        const response = await fetch('https://api.ebay.com/ws/api.dll', {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '3', // UK Site ID
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
                'X-EBAY-API-IAF-TOKEN': `${process.env.EBAY_USER_TOKEN}`,
                'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
                <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
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
                </AddFixedPriceItemRequest>`,
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
