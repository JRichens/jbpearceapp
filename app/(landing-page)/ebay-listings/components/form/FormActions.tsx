'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { FormSectionProps } from '../../types/form.types'
import { VerificationResult } from './VerificationResult'

interface FormActionsProps extends FormSectionProps {
    isVerified: boolean
    isLoading: boolean
    verificationResult: any
}

export function FormActions({
    formState,
    isVerified,
    isLoading,
    verificationResult,
}: FormActionsProps) {
    // Check if all required fields are filled
    const isFormValid = Boolean(
        formState.partNumber && // Part Number is required
            formState.paintCode && // Paint Code is required
            formState.price && // Price is required
            formState.shippingProfileId && // Shipping Profile is required
            formState.photos.length > 0 // At least one photo is required
    )

    return (
        <div className="space-y-6">
            {verificationResult && (
                <VerificationResult result={verificationResult} />
            )}

            <div className="pt-4">
                {!isVerified && (
                    <Button
                        type="submit"
                        className="w-full text-xl"
                        disabled={
                            isLoading ||
                            formState.isCategoriesLoading ||
                            !isFormValid
                        }
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            'Verify Listing'
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
