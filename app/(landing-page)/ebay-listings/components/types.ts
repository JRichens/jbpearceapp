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

export const CONDITIONS = [
    { id: 'New', name: 'New' },
    { id: 'Used', name: 'Used' },
    { id: 'For parts or not working', name: 'For parts or not working' },
] as const

export const MAX_PHOTOS = 24
