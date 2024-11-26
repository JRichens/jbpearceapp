import { Car } from '@prisma/client'

export interface Category {
    id: string
    name: string
    fullPath: string
    finalName: string
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
    brand: string
    make: string
    paintCode: string
    placement: string
    price: string
    verificationResult: VerificationResult | null
    isVerified: boolean
    selectedCondition: string
    selectedCategory: Category | null
    vehicle: Car | null
    selectedTitleParams: Set<string>
    productionYearInfo: ProductionYearInfo | null
    shippingProfileId: string | null
}

export interface FormSectionProps {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
}

export interface FeesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    verificationResult: VerificationResult | null
    isLoading: boolean
    onSubmit: () => void
}

export const CONDITIONS = [
    { id: 'New', name: 'New' },
    { id: 'Used', name: 'Used' },
    { id: 'For parts or not working', name: 'For parts or not working' },
] as const

export const MAX_PHOTOS = 24

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
    brand: '',
    make: '',
    paintCode: '',
    placement: '',
    price: '0',
    verificationResult: null,
    isVerified: false,
    selectedCondition: 'Used',
    selectedCategory: null,
    vehicle: null,
    selectedTitleParams: new Set(['dvlaMake', 'dvlaModel', 'modelSeries']),
    productionYearInfo: null,
    shippingProfileId: null,
}
