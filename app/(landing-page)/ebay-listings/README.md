# eBay Listings Module

This module provides functionality for creating, managing, and analyzing eBay listings for vehicle parts. It integrates with the eBay API to fetch categories, verify listings, and submit listings to eBay.

## File Structure

```
app/(landing-page)/ebay-listings/
├── README.md                       # This documentation file
├── page.tsx                        # Main page component that renders the ListItem component
├── components/                     # UI components
│   ├── compare-listings.tsx        # Component for comparing two eBay listings
│   ├── list-item.tsx               # Main container component for the listing form
│   ├── my-listings.tsx             # Component for displaying a user's eBay listings
│   ├── dialog/                     # Dialog components
│   │   └── FeesDialog.tsx          # Dialog for displaying eBay fees before submission
│   ├── form/                       # Form components
│   │   ├── CategorySelect.tsx      # Component for selecting eBay categories
│   │   ├── ConditionSelect.tsx     # Component for selecting item condition
│   │   ├── DetailsSection.tsx      # Component for entering item details
│   │   ├── FormActions.tsx         # Component for form action buttons
│   │   ├── PartDescriptionSection.tsx # Component for entering part description
│   │   ├── PhotoUploader.tsx       # Component for uploading photos
│   │   ├── PriceQuantityInputs.tsx # Component for entering price and quantity
│   │   ├── ShippingProfileSelect.tsx # Component for selecting shipping profile
│   │   ├── TitleParameters.tsx     # Component for selecting title parameters
│   │   ├── TitleSection.tsx        # Component for displaying and editing the title
│   │   ├── TyreInfo.tsx            # Component for entering tyre information
│   │   └── WheelTyreInfo.tsx       # Component for entering wheel and tyre information
│   ├── listing/                    # Listing components
│   │   └── ListingForm.tsx         # Main form component for creating eBay listings
│   └── price-comparison/           # Price comparison components
│       └── PriceComparisonSection.tsx # Component for displaying price comparisons
├── constants/                      # Constants used in the application
│   └── categories.ts               # Constants for wheel and tyre categories
├── hooks/                          # Custom React hooks
│   ├── usePriceComparisons.ts      # Hook for fetching price comparison data
│   └── useListingForm.ts           # Hook for managing the listing form state and logic
├── services/                       # API services
│   └── api.ts                      # Functions for interacting with the eBay API
├── types/                          # TypeScript type definitions
│   ├── ebayTypes.ts                # Types for eBay API responses
│   └── listingTypes.ts             # Types for the listing form
└── utils/                          # Utility functions
```

## Key Components and Functionality

### Main Page Component

-   **page.tsx**: The main page component that renders the ListItem component. It's marked as dynamic to ensure it always fetches fresh data.

### Form Components

-   **ListingForm.tsx**: The main form component for creating eBay listings. It manages the form state and renders either the ListingFormSection or PriceComparisonSection based on the page number.
-   **ListingFormSection.tsx**: Renders the form sections for creating an eBay listing, including part description, title, details, category selection, condition selection, price/quantity inputs, photo uploading, and shipping profile selection.
-   **TitleParameters.tsx**: Allows users to select parameters for the eBay listing title, such as make, model, year, etc.

### Price Comparison

-   **PriceComparisonSection.tsx**: Displays price comparisons for similar eBay listings, helping users set competitive prices.
-   **usePriceComparisons.ts**: A custom hook that fetches price comparison data from the eBay API.

### Other Components

-   **compare-listings.tsx**: Allows users to compare two eBay listings to identify differences.
-   **my-listings.tsx**: Displays a user's eBay listings in a table.
-   **FeesDialog.tsx**: Displays the fees for an eBay listing before submission.

## Data Flow

1. User enters vehicle information and part description in the PartDescriptionSection.
2. The useListingForm hook fetches eBay categories based on the vehicle and part description.
3. User selects a category and enters additional details like title parameters, price, condition, etc.
4. User uploads photos of the part.
5. User clicks "Verify Listing" to check the listing details and fees.
6. The FeesDialog displays the fees for the listing.
7. User clicks "Submit Listing" to create the listing on eBay.
8. The form data is sent to the server via the `submitListing` function in `api.ts`.
9. On the server side, the form data is processed in the API route handler (`app/api/ebay-listings/route.ts`).
10. For verification, the API route calls `verifyEbayListing` from `lib/ebay/verify-listing.ts`.
11. For submission, the API route calls `addEbayListing` from `lib/ebay/add-listing.ts`.
12. Both functions generate XML data for the eBay API by:

    - Reading an HTML template from `lib/ebay/listing-template.html`
    - Replacing placeholders in the template with actual data
    - Generating XML for item specifics, best offer details, and other listing details
    - Wrapping the HTML template in CDATA to preserve HTML formatting

    The `listing-template.html` file is a structured HTML template that defines the layout and styling of the eBay listing. It includes:

    - CSS styles for responsive design and visual presentation
    - A header section with the company logo and information
    - A part information section with placeholders like `{{partDescription}}` and `{{partNumber}}`
    - Placeholder divs (e.g., `<div id="compatibility-section-placeholder"></div>`) that are replaced with dynamically generated HTML
    - A tabbed section with information about shipping, item condition, contact, warranty, returns, and feedback

    This template ensures all eBay listings have a consistent, professional appearance while allowing dynamic content to be inserted based on the specific item being listed.

13. The XML data is sent to the eBay API using the appropriate API call:
    - `VerifyAddFixedPriceItemRequest` for verification
    - `AddFixedPriceItemRequest` for submission
14. The response from the eBay API is processed and returned to the client.
15. For successful submissions, the listing is also saved to the database using Prisma.

## Integration with External Services

### eBay API

The module integrates with the eBay API to:

-   Fetch categories based on search terms
-   Verify listings and calculate fees
-   Submit listings to eBay
-   Fetch price comparisons for similar listings

### Perplexity API (via Claude AI)

The module uses the Perplexity API through the askClaudeProductionYear server action to:

-   Get production year information for vehicles
-   Determine part compatibility across different model years
-   Provide additional context for listing descriptions

The API is called in the `fetchProductionYear` function within the `useListingForm` hook. This function is automatically triggered when:

1. A vehicle is selected
2. A part description is entered
3. It's the initial form load (hasInitializedCategories is false)
4. The vehicle is not a wheels/tyres type

The function constructs a vehicle string from the vehicle's make, model, series, and year of manufacture, then calls the `askClaudeProductionYear` server action with this string and the part description. The resulting production year information (including from year, to year, facelift year, and compatibility description) is stored in state and used throughout the form, particularly in the title generation and part compatibility sections.

## Database Integration

The module integrates with the Prisma ORM to:

-   Store eBay listings in the database
-   Associate listings with vehicles and users
-   Track listing status, prices, and dates

## Key Features

1. **Intelligent Title Generation**: Automatically generates optimized eBay listing titles based on vehicle information and part description.
2. **Production Year Information**: Uses AI to determine production years and part compatibility.
3. **Price Comparison**: Shows prices of similar listings to help users set competitive prices.
4. **Photo Management**: Allows users to upload and manage photos for listings.
5. **Listing Verification**: Verifies listings and calculates fees before submission.
6. **Listing Management**: Allows users to view and manage their eBay listings.
7. **Listing Comparison**: Allows users to compare two listings to identify differences.

## Usage

1. Navigate to the eBay Listings page.
2. Enter vehicle information and part description.
3. Select a category and enter additional details.
4. Upload photos of the part.
5. Verify the listing to check details and fees.
6. Submit the listing to create it on eBay.
7. View and manage listings on the My Listings page.
