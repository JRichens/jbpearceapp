import { Car } from '@prisma/client'

export interface Category {
    id: string
    name: string
    fullPath: string // Full category path
    finalName: string // Just the final category name
}

export interface VerificationResult {
    fees: {
        insertionFee: string
        totalFees: string
    }
}

export interface ProductionYearInfo {
    from: string
    to: string
    facelift: string
    description: string
}

export const CONDITIONS = [
    { id: 'New', name: 'New' },
    { id: 'Used', name: 'Used' },
    { id: 'For parts or not working', name: 'For parts or not working' },
] as const

export const MAX_PHOTOS = 24

export interface FormState {
    isLoading: boolean
    photos: File[]
    photosPreviews: string[]
    categories: Category[]
    isCategoriesLoading: boolean
    categoriesError: string | null
    title: string
    partDescription: string
    partNumber: string
    partNumbers: string[]
    brand: string
    make: string
    paintCode: string
    placement: string
    price: string
    quantity: string
    showMinimumOffer: boolean
    verificationResult: VerificationResult | null
    isVerified: boolean
    selectedCondition: string
    selectedCategory: Category | null
    vehicle: Car | null
    selectedTitleParams: Set<string>
    productionYearInfo: ProductionYearInfo | null
    shippingProfileId: string | null
    allowOffers: boolean
    minimumOfferPrice: string
    searchByPartNumber: boolean // New field for part number search flag
    activePartNumber: string // New field for storing active part number being searched
}

export interface FormSectionProps {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
}

export const initialFormState: FormState = {
    isLoading: false,
    photos: [],
    photosPreviews: [],
    categories: [],
    isCategoriesLoading: false,
    categoriesError: null,
    title: '',
    partDescription: '',
    partNumber: '',
    partNumbers: [''],
    brand: '',
    make: '',
    paintCode: '',
    placement: '',
    price: '0',
    quantity: '1',
    showMinimumOffer: false,
    verificationResult: null,
    isVerified: false,
    selectedCondition: 'Used',
    selectedCategory: null,
    vehicle: null,
    selectedTitleParams: new Set(['dvlaMake', 'dvlaModel', 'modelSeries']),
    productionYearInfo: null,
    shippingProfileId: null,
    allowOffers: false,
    minimumOfferPrice: '0',
    searchByPartNumber: false, // Initialize search by part number flag as false
    activePartNumber: '', // Initialize active part number as empty string
}
