import CompareListings from '../components/compare-listings'

export const metadata = {
    title: 'Compare eBay Listings',
    description:
        'Compare API-created and manually created eBay listings to identify missing fields and differences',
}

export default function ComparePage() {
    return <CompareListings />
}
