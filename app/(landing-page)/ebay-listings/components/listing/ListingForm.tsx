'use client'

import { useRef, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useListingForm } from '../../hooks/useListingForm'
import { PartDescriptionSection } from '../form/PartDescriptionSection'
import { TitleSection } from '../form/TitleSection'
import { DetailsSection } from '../form/DetailsSection'
import { CategorySelect } from '../form/CategorySelect'
import { ConditionSelect } from '../form/ConditionSelect'
import { PriceQuantityInputs } from '../form/PriceQuantityInputs'
import { PhotoUploader } from '../form/PhotoUploader'
import { ShippingProfileSelect } from '../form/ShippingProfileSelect'
import { FormActions } from '../form/FormActions'
import { FeesDialog } from '../dialog/FeesDialog'

export function ListingForm() {
    const {
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
        fetchProductionYear,
    } = useListingForm()

    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
    const [showFullForm, setShowFullForm] = useState(false)
    const [showFeesDialog, setShowFeesDialog] = useState(false)
    const [hasSearchedVehicle, setHasSearchedVehicle] = useState(false)
    const partDescriptionRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // Effect to show full form when conditions are met
    useEffect(() => {
        if (
            hasSearchedVehicle &&
            vehicle &&
            formState.partDescription &&
            productionYearInfo &&
            !isLoadingProductionYear &&
            formState.selectedCategory
        ) {
            setShowFullForm(true)
        } else {
            setShowFullForm(false)
            if (!formState.partDescription) {
                setSelectedPlacements([])
                if (partDescriptionRef.current) {
                    partDescriptionRef.current.focus()
                }
            }
        }
    }, [
        hasSearchedVehicle,
        vehicle,
        formState.partDescription,
        productionYearInfo,
        isLoadingProductionYear,
        formState.selectedCategory,
    ])

    // Effect to set default production years when production year info is loaded
    useEffect(() => {
        if (
            productionYearInfo &&
            !formState.selectedTitleParams.has('productionYears')
        ) {
            handleTitleParamChange('productionYears')
        }
    }, [productionYearInfo])

    // Update placement string when selections change
    useEffect(() => {
        if (selectedPlacements.length > 0) {
            const placementString = selectedPlacements.sort().join(' ')
            setFormState((prev) => ({
                ...prev,
                placement: placementString,
            }))
        } else {
            setFormState((prev) => ({
                ...prev,
                placement: '',
            }))
        }
    }, [selectedPlacements, setFormState])

    // Show fees dialog when verification is successful
    useEffect(() => {
        if (formState.isVerified && formState.verificationResult) {
            setShowFeesDialog(true)
        } else if (!formState.isVerified) {
            setShowFeesDialog(false)
        }
    }, [formState.isVerified, formState.verificationResult])

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
                setShowFullForm(false)
                setHasSearchedVehicle(false)
            }
        } catch (error) {
            console.error('Form submission error:', error)
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

    const handleVehicleSearch = (newVehicle: any) => {
        setVehicle(newVehicle)
        setHasSearchedVehicle(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create eBay Listing</h2>
                <Badge
                    variant={
                        process.env.NEXT_PUBLIC_ENABLE_EBAY_LISTING === 'true'
                            ? 'default'
                            : 'secondary'
                    }
                >
                    {process.env.NEXT_PUBLIC_ENABLE_EBAY_LISTING === 'true'
                        ? 'Live Mode'
                        : 'Test Mode'}
                </Badge>
            </div>

            <PartDescriptionSection
                formState={formState}
                setFormState={setFormState}
                onFormChange={handleFormChange}
                partDescriptionRef={partDescriptionRef}
                vehicle={vehicle}
                setVehicle={handleVehicleSearch}
                productionYearInfo={productionYearInfo}
                isLoadingProductionYear={isLoadingProductionYear}
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

                    {isLoadingProductionYear && (
                        <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                            <div className="flex items-center">
                                <Loader2 className="mr-2 animate-spin" />
                                <div className="text-sm font-medium text-gray-500">
                                    Waiting for production year compatibility...
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoadingProductionYear && (
                        <CategorySelect
                            categories={formState.categories}
                            selectedCategory={formState.selectedCategory}
                            onCategoryChange={handleCategoryChange}
                            isCategoriesLoading={formState.isCategoriesLoading}
                            categoriesError={formState.categoriesError}
                            vehicle={formState.vehicle}
                            partDescription={formState.partDescription}
                            className="space-y-2"
                        />
                    )}
                </>
            )}

            {showFullForm && formState.selectedCategory && (
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
                        onPriceChange={handleFormChange}
                        onQuantityChange={handleFormChange}
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

                    <ShippingProfileSelect onProfileChange={handleFormChange} />

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
                        verificationResult={formState.verificationResult}
                    />
                </form>
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
