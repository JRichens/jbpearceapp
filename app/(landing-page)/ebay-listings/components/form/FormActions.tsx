'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { FormSectionProps } from '../../types/listingTypes'
import { VerificationResult } from './VerificationResult'

interface FormActionsProps extends FormSectionProps {
    isVerified: boolean
    isLoading: boolean
    verificationResult: any
    isUploadingPhotos: boolean
}

export function FormActions({
    formState,
    isVerified,
    isLoading,
    verificationResult,
    isUploadingPhotos,
}: FormActionsProps) {
    // Detailed requirement checks with status messages
    const requirements = {
        ...(formState.selectedCategory?.id === '179681'
            ? {
                  wheelDiameter: {
                      isMissing: !formState.wheelDiameter,
                      message: 'Wheel Diameter is required',
                  },
                  tyreWidth: {
                      isMissing: !formState.tyreWidth,
                      message: 'Tyre Width is required',
                  },
                  aspectRatio: {
                      isMissing: !formState.aspectRatio,
                      message: 'Aspect Ratio is required',
                  },
              }
            : formState.selectedCategory?.id === '179680'
            ? {
                  brand: {
                      isMissing: !formState.brand,
                      message: 'Brand is required',
                  },
                  tyreModel: {
                      isMissing: !formState.tyreModel,
                      message: 'Model is required',
                  },
                  treadDepth: {
                      isMissing: !formState.treadDepth,
                      message: 'Tread Depth is required',
                  },
                  dotDateCode: {
                      isMissing: !formState.dotDateCode,
                      message: 'DOT Date Code is required',
                  },
                  runFlat: {
                      isMissing: !formState.runFlat,
                      message: 'Run Flat selection is required',
                  },
                  wheelDiameter: {
                      isMissing: !formState.wheelDiameter,
                      message: 'Rim Diameter is required',
                  },
                  tyreWidth: {
                      isMissing: !formState.tyreWidth,
                      message: 'Tyre Width is required',
                  },
                  aspectRatio: {
                      isMissing: !formState.aspectRatio,
                      message: 'Aspect Ratio is required',
                  },
                  unitQty: {
                      isMissing: !formState.unitQty,
                      message: 'Unit Quantity is required',
                  },
              }
            : {
                  partNumber: {
                      isMissing: !formState.partNumbers.some(
                          (num) => num.trim() !== ''
                      ),
                      message: 'At least one part number is required',
                  },
              }),
        partDescription: {
            isMissing: !formState.partDescription,
            message: 'Part description is required',
        },
        price: {
            isMissing: !(parseFloat(formState.price) > 0),
            message: `Valid price is required (current: ${formState.price})`,
        },
        shippingProfile: {
            isMissing: !formState.shippingProfileId,
            message: 'Shipping profile selection is required',
        },
        paintCode: {
            isMissing: !formState.paintCode,
            message: 'Paint code is required',
        },
        photos: {
            isMissing: formState.photos.length === 0,
            message: 'At least one photo is required',
        },
        photoUploads: {
            isMissing:
                formState.photos.length > formState.uploadedPhotoUrls.length,
            message: `Waiting for photo uploads to complete (${formState.uploadedPhotoUrls.length}/${formState.photos.length})`,
        },
        conditionDescription: {
            isMissing: !formState.conditionDescription,
            message: 'Condition description is required',
        },
    }

    // Check if all required fields are filled
    const isFormValid = !Object.values(requirements).some(
        (req) => req.isMissing
    )

    return (
        <div className="space-y-6">
            {verificationResult && (
                <VerificationResult result={verificationResult} />
            )}

            <div className="space-y-4">
                {!isVerified && (
                    <>
                        <Button
                            type="submit"
                            className="w-full text-xl"
                            disabled={
                                isLoading ||
                                formState.isCategoriesLoading ||
                                !isFormValid ||
                                isUploadingPhotos
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

                        {/* Missing Requirements List */}
                        {(!isFormValid || isUploadingPhotos) && (
                            <div className="text-sm space-y-1">
                                <p className="font-medium text-red-500">
                                    Missing Requirements:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {Object.entries(requirements).map(
                                        ([key, requirement]) =>
                                            requirement.isMissing && (
                                                <li
                                                    key={key}
                                                    className="text-red-500"
                                                >
                                                    {requirement.message}
                                                </li>
                                            )
                                    )}
                                </ul>
                                {isUploadingPhotos && (
                                    <p className="text-blue-500 mt-2">
                                        Please wait for all photo uploads to
                                        complete before verifying
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
