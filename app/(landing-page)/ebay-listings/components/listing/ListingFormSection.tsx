import { useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { FormState } from '../../types/listingTypes'
import {
    PartDescriptionSection,
    PartDescriptionSectionRef,
} from '../form/PartDescriptionSection'
import { TitleSection } from '../form/TitleSection'
import { DetailsSection } from '../form/DetailsSection'
import { CategorySelect } from '../form/CategorySelect'
import { ConditionSelect } from '../form/ConditionSelect'
import { PriceQuantityInputs } from '../form/PriceQuantityInputs'
import { PhotoUploader } from '../form/PhotoUploader'
import { ShippingProfileSelect } from '../form/ShippingProfileSelect'
import { FormActions } from '../form/FormActions'
import { FeesDialog } from '../dialog/FeesDialog'
import { Car } from '@prisma/client'
import { Dispatch, SetStateAction } from 'react'

interface ListingFormSectionProps {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    vehicle: Car | null
    setVehicle: Dispatch<SetStateAction<Car | null>>
    productionYearInfo: any
    isLoadingProductionYear: boolean
    handleFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    handleSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        action: 'verify' | 'submit'
    ) => Promise<void>
    handlePhotosChange: (photos: File[], previews: string[]) => void
    handleCategoryChange: (categoryId: string) => void
    handleTitleParamChange: (param: string) => void
    resetForm: () => void
    selectedPlacements: string[]
    setSelectedPlacements: React.Dispatch<React.SetStateAction<string[]>>
    showFeesDialog: boolean
    setShowFeesDialog: React.Dispatch<React.SetStateAction<boolean>>
    hasSearchedVehicle: boolean
    setHasSearchedVehicle: React.Dispatch<React.SetStateAction<boolean>>
    setPageNumber: Dispatch<SetStateAction<number>>
}

export function ListingFormSection({
    formState,
    setFormState,
    vehicle,
    setVehicle,
    productionYearInfo,
    isLoadingProductionYear,
    handleFormChange,
    handleSubmit,
    handlePhotosChange,
    handleCategoryChange,
    handleTitleParamChange,
    resetForm,
    selectedPlacements,
    setSelectedPlacements,
    showFeesDialog,
    setShowFeesDialog,
    hasSearchedVehicle,
    setHasSearchedVehicle,
    setPageNumber,
}: ListingFormSectionProps) {
    const { toast } = useToast()
    const partDescriptionRef = useRef<HTMLInputElement>(null)
    const partDescriptionSectionRef = useRef<PartDescriptionSectionRef>(null)
    const formRef = useRef<HTMLFormElement>(null)

    const handleAllowOffersChange = (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            allowOffers: checked,
            showMinimumOffer: checked,
            minimumOfferPrice: checked ? prev.minimumOfferPrice : '0',
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleMinimumOfferPriceChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => {
        const value = typeof e === 'string' ? e : e.target.value
        setFormState((prev) => ({
            ...prev,
            minimumOfferPrice: value,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handlePlacementChange = (value: string) => {
        setSelectedPlacements((prev) => {
            if (prev.includes(value)) {
                return prev.filter((p) => p !== value)
            }
            if (prev.length < 2) {
                return [...prev, value]
            }
            return prev
        })
    }

    const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await handleSubmit(e, formState.isVerified ? 'submit' : 'verify')

            if (formState.isVerified) {
                setShowFeesDialog(false)
                if (partDescriptionRef.current) {
                    partDescriptionRef.current.focus()
                }
                resetForm()
                setSelectedPlacements([])
                setHasSearchedVehicle(false)
                if (partDescriptionSectionRef.current) {
                    partDescriptionSectionRef.current.resetPartNumbers()
                }
                toast({
                    title: 'Success!',
                    description:
                        'Listing has been successfully created on eBay',
                    className: 'bg-green-500 text-white border-green-600',
                })
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast({
                title: 'Error',
                description: 'Failed to create listing. Please try again.',
                variant: 'destructive',
            })
        }
    }

    const handleModalSubmit = async () => {
        if (formRef.current) {
            const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true,
            })
            formRef.current.dispatchEvent(submitEvent)
        }
    }

    // Effect to show full form when conditions are met
    useEffect(() => {
        if (
            hasSearchedVehicle &&
            vehicle &&
            formState.partDescription &&
            !isLoadingProductionYear
        ) {
            if (
                productionYearInfo &&
                !formState.selectedTitleParams.has('productionYears')
            ) {
                handleTitleParamChange('productionYears')
            }

            // Initialize paint code from vehicle data
            if (vehicle.paintCode && !formState.paintCode) {
                setFormState((prev) => ({
                    ...prev,
                    paintCode: vehicle.paintCode || '',
                    vehicle: vehicle, // Store the full vehicle object
                }))
            }
        }
    }, [
        hasSearchedVehicle,
        vehicle,
        formState.partDescription,
        productionYearInfo,
        isLoadingProductionYear,
    ])

    // Effect to show fees dialog when verification is successful
    useEffect(() => {
        if (formState.isVerified && formState.verificationResult) {
            setShowFeesDialog(true)
        }
    }, [formState.isVerified, formState.verificationResult])

    return (
        <div className="space-y-6 p-1">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create eBay Listing</h2>
            </div>

            <PartDescriptionSection
                ref={partDescriptionSectionRef}
                formState={formState}
                setFormState={setFormState}
                onFormChange={handleFormChange}
                partDescriptionRef={partDescriptionRef}
                vehicle={vehicle}
                setVehicle={setVehicle}
                setHasSearchedVehicle={setHasSearchedVehicle}
                productionYearInfo={productionYearInfo}
                isLoadingProductionYear={isLoadingProductionYear}
                setPageNumber={setPageNumber}
            />

            {hasSearchedVehicle && vehicle && (
                <>
                    <TitleSection
                        formState={formState}
                        setFormState={setFormState}
                        onFormChange={handleFormChange}
                        vehicle={vehicle}
                        productionYearInfo={productionYearInfo}
                        onTitleParamChange={handleTitleParamChange}
                    />

                    <CategorySelect
                        categories={formState.categories}
                        selectedCategory={formState.selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        isCategoriesLoading={formState.isCategoriesLoading}
                        categoriesError={formState.categoriesError}
                        vehicle={vehicle}
                        partDescription={formState.partDescription}
                    />

                    {formState.selectedCategory && (
                        <form
                            ref={formRef}
                            onSubmit={handleVerifySubmit}
                            className="space-y-6"
                        >
                            <DetailsSection
                                formState={formState}
                                setFormState={setFormState}
                                onFormChange={handleFormChange}
                                selectedPlacements={selectedPlacements}
                                onPlacementChange={handlePlacementChange}
                            />

                            <PriceQuantityInputs
                                formState={formState}
                                setFormState={setFormState}
                                onPriceChange={handleFormChange}
                                onQuantityChange={handleFormChange}
                                onAllowOffersChange={handleAllowOffersChange}
                                onMinimumOfferPriceChange={
                                    handleMinimumOfferPriceChange
                                }
                            />

                            <ConditionSelect
                                selectedCondition={formState.selectedCondition}
                                onConditionChange={(condition) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        selectedCondition: condition,
                                    }))
                                }
                                onDescriptionChange={handleFormChange}
                            />

                            <ShippingProfileSelect
                                formState={formState}
                                setFormState={setFormState}
                                onProfileChange={handleFormChange}
                            />

                            <PhotoUploader
                                photos={formState.photos}
                                photosPreviews={formState.photosPreviews}
                                onPhotosChange={handlePhotosChange}
                                isLoading={formState.isLoading}
                            />

                            <FormActions
                                formState={formState}
                                setFormState={setFormState}
                                onFormChange={handleFormChange}
                                isVerified={formState.isVerified}
                                isLoading={formState.isLoading}
                                verificationResult={
                                    formState.verificationResult
                                }
                            />
                        </form>
                    )}
                </>
            )}

            <FeesDialog
                open={showFeesDialog}
                onOpenChange={setShowFeesDialog}
                verificationResult={formState.verificationResult}
                isLoading={formState.isLoading}
                onSubmit={handleModalSubmit}
            />
        </div>
    )
}