'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Category, VerificationResult as VerificationResultType } from './types'
import { PhotoUploader } from './PhotoUploader'
import { VerificationResult } from './VerificationResult'
import { Car } from '@prisma/client'
import { CategorySelect } from './form/CategorySelect'
import { VehicleInfo } from './form/VehicleInfo'
import { ConditionSelect } from './form/ConditionSelect'
import { PriceQuantityInputs } from './form/PriceQuantityInputs'
import { ShippingProfileSelect } from './form/ShippingProfileSelect'
import {
    TitleParameters,
    TITLE_PARAMETERS,
    formatNomCC,
} from './form/TitleParameters'
import { ListingDescription } from './form/ListingDescription'

interface FormState {
    isLoading: boolean
    photos: File[]
    photosPreviews: string[]
    categories: Category[]
    isCategoriesLoading: boolean
    categoriesError: string | null
    title: string
    partDescription: string
    verificationResult: VerificationResultType | null
    isVerified: boolean
    selectedCondition: string
    selectedCategory: Category | null
    vehicle: Car | null
    selectedTitleParams: Set<string>
}

const initialFormState: FormState = {
    isLoading: false,
    photos: [],
    photosPreviews: [],
    categories: [],
    isCategoriesLoading: false,
    categoriesError: null,
    title: '',
    partDescription: '',
    verificationResult: null,
    isVerified: false,
    selectedCondition: 'Used',
    selectedCategory: null,
    vehicle: null,
    selectedTitleParams: new Set(['dvlaMake', 'dvlaModel', 'modelSeries']),
}

export default function ListItem() {
    const [formState, setFormState] = useState<FormState>(initialFormState)
    const [vehicle, setVehicle] = useState<Car | null>(null)
    const partDescriptionRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Focus the part description input when component mounts
        if (partDescriptionRef.current) {
            partDescriptionRef.current.focus()
        }
    }, [])

    useEffect(() => {
        if (vehicle !== formState.vehicle) {
            setFormState((prev) => ({ ...prev, vehicle }))
        }
    }, [vehicle])

    useEffect(() => {
        if (formState.vehicle && formState.partDescription) {
            const titleParts = TITLE_PARAMETERS.filter((param) =>
                formState.selectedTitleParams.has(param.key)
            )
                .map((param) => {
                    if (param.isCustom) {
                        return param.value
                    }
                    const value = formState.vehicle![param.key as keyof Car]
                    if (param.key === 'nomCC' && value) {
                        return formatNomCC(value)
                    }
                    return value
                })
                .filter(Boolean)
            const fullTitle = [...titleParts, formState.partDescription].join(
                ' '
            )
            setFormState((prev) => ({ ...prev, title: fullTitle }))
        }
    }, [
        formState.vehicle,
        formState.partDescription,
        formState.selectedTitleParams,
    ])

    useEffect(() => {
        if (formState.vehicle && formState.partDescription) {
            const searchTerm = `${formState.vehicle.dvlaMake} ${formState.partDescription}`
            fetchCategories(searchTerm)
        }
    }, [formState.vehicle, formState.partDescription])

    useEffect(() => {
        return () => {
            formState.photosPreviews.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [formState.photosPreviews])

    const fetchCategories = async (searchTerm: string) => {
        try {
            setFormState((prev) => ({
                ...prev,
                isCategoriesLoading: true,
                categoriesError: null,
            }))

            const response = await fetch(
                `/api/ebay-listings/categories?search=${encodeURIComponent(
                    searchTerm
                )}&useVehicleSearch=true`
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch categories')
            }

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format')
            }

            setFormState((prev) => ({ ...prev, categories: data }))

            if (data.length > 0) {
                handleCategoryChange(data[0].id)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            setFormState((prev) => ({
                ...prev,
                categoriesError:
                    error instanceof Error
                        ? error.message
                        : 'Failed to load categories',
            }))
            toast.error('Failed to load categories. Please try again.')
        } finally {
            setFormState((prev) => ({ ...prev, isCategoriesLoading: false }))
        }
    }

    const resetForm = () => {
        setFormState(initialFormState)
        setVehicle(null)
    }

    const handlePhotosChange = (newPhotos: File[], newPreviews: string[]) => {
        setFormState((prev) => ({
            ...prev,
            photos: newPhotos,
            photosPreviews: newPreviews,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleCategoryChange = (categoryId: string) => {
        const category = formState.categories.find(
            (cat) => cat.id === categoryId
        )
        setFormState((prev) => ({
            ...prev,
            selectedCategory: category || null,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleFormChange = () => {
        setFormState((prev) => ({
            ...prev,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleTitleParamChange = (param: string) => {
        const newParams = new Set(formState.selectedTitleParams)
        if (newParams.has(param)) {
            newParams.delete(param)
        } else {
            newParams.add(param)
        }
        setFormState((prev) => ({ ...prev, selectedTitleParams: newParams }))
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
        action: 'verify' | 'submit'
    ) => {
        event.preventDefault()
        setFormState((prev) => ({ ...prev, isLoading: true }))

        try {
            const formData = new FormData(event.currentTarget)
            formData.append('action', action)

            if (formState.vehicle) {
                formData.append(
                    'vehicleData',
                    JSON.stringify(formState.vehicle)
                )
            }

            formState.photos.forEach((photo) => {
                formData.append('photos', photo)
            })

            const response = await fetch('/api/ebay-listings', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.details || `Failed to ${action} listing`)
            }

            const result = await response.json()

            if (action === 'verify') {
                setFormState((prev) => ({
                    ...prev,
                    verificationResult: result.verificationResult,
                    isVerified: true,
                }))
                toast.success(
                    'Listing verified successfully! Review the fees and submit if you wish to proceed.'
                )
            } else {
                toast.success('Listing submitted successfully!')
                resetForm()
            }
        } catch (error) {
            console.error(`Error ${action}ing listing:`, error)
            toast.error(
                error instanceof Error
                    ? error.message
                    : `Failed to ${action} listing`
            )
            if (action === 'verify') {
                setFormState((prev) => ({
                    ...prev,
                    isVerified: false,
                    verificationResult: null,
                }))
            }
        } finally {
            setFormState((prev) => ({ ...prev, isLoading: false }))
        }
    }

    return (
        <Card className="p-4 sm:p-6 w-full max-w-[600px]">
            <h2 className="text-2xl font-bold mb-4">List Item on eBay</h2>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="partDescription">Part Description *</Label>
                    <Input
                        ref={partDescriptionRef}
                        id="partDescription"
                        name="partDescription"
                        value={formState.partDescription}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormState((prev) => ({
                                ...prev,
                                partDescription: e.target.value,
                            }))
                            handleFormChange()
                        }}
                        placeholder="Headlight, Wing Mirror, Bonnet..."
                        required
                        className="text-xl"
                        autoFocus
                    />
                </div>

                <VehicleInfo
                    vehicle={vehicle}
                    setVehicle={setVehicle}
                    className="space-y-2"
                    hideVehicleFound={true}
                />

                {formState.vehicle && (
                    <Card className="p-4">
                        <ScrollArea className="h-[150px]">
                            <TitleParameters
                                vehicle={formState.vehicle}
                                selectedParams={formState.selectedTitleParams}
                                onParamChange={handleTitleParamChange}
                                className="space-y-2"
                            />
                        </ScrollArea>
                    </Card>
                )}
            </div>

            <form
                onSubmit={(e) =>
                    handleSubmit(e, formState.isVerified ? 'submit' : 'verify')
                }
                className="space-y-2 mt-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="title">
                        {'Title (' + formState.title.length + '/80)'}
                    </Label>
                    <Textarea
                        id="title"
                        name="title"
                        value={formState.title}
                        onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                            setFormState((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                            handleFormChange()
                        }}
                        placeholder="Enter item title (up to 80 characters)"
                        required
                        maxLength={80}
                        className="no-scrollbar resize-none h-[100px] text-xl"
                    />
                </div>

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

                <ListingDescription
                    vehicle={formState.vehicle}
                    partDescription={formState.partDescription}
                    onChange={handleFormChange}
                    className="space-y-2"
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

                <PhotoUploader
                    photos={formState.photos}
                    photosPreviews={formState.photosPreviews}
                    onPhotosChange={handlePhotosChange}
                    isLoading={formState.isLoading}
                />

                <ShippingProfileSelect onProfileChange={handleFormChange} />

                {formState.verificationResult && (
                    <VerificationResult result={formState.verificationResult} />
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        className="w-full text-xl"
                        disabled={
                            formState.isLoading || formState.isCategoriesLoading
                        }
                    >
                        {formState.isLoading
                            ? formState.isVerified
                                ? 'Submitting...'
                                : 'Verifying...'
                            : formState.isVerified
                            ? 'Submit Listing'
                            : 'Verify Listing'}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
