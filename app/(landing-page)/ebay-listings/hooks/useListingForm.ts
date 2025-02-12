'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useToast } from '@/components/ui/use-toast'
import { Car } from '@prisma/client'
import { FormState, initialFormState, Category } from '../types/listingTypes'
import { fetchCategoriesApi, submitListing } from '../services/api'
import {
    TITLE_PARAMETERS,
    formatNomCC,
} from '../components/form/TitleParameters'
import { askClaudeProductionYear } from '@/actions/claude-ai/askClaudeProductionYear'
import { WHEEL_TYRE_CATEGORIES } from '../constants/categories'

interface ProductionYearInfo {
    from: string
    to: string
    facelift: string
    description: string
}

export function useListingForm() {
    const [formState, setFormState] = useState<FormState>(initialFormState)
    const [vehicle, setVehicle] = useState<Car | null>(null)
    const [productionYearInfo, setProductionYearInfo] =
        useState<ProductionYearInfo | null>(null)
    const [isLoadingProductionYear, setIsLoadingProductionYear] =
        useState(false)
    const [hasInitializedCategories, setHasInitializedCategories] =
        useState(false)
    const { toast: shadcnToast } = useToast()

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => {
        if (typeof e === 'string') {
            setFormState((prev) => ({
                ...prev,
                shippingProfileId: e,
                isVerified: false,
                verificationResult: null,
            }))
        } else if (e?.target) {
            const { name, value } = e.target
            setFormState((prev) => ({
                ...prev,
                [name]: value,
                isVerified: false,
                verificationResult: null,
            }))
        } else {
            setFormState((prev) => ({
                ...prev,
                isVerified: false,
                verificationResult: null,
            }))
        }
    }

    const handleCategoryChange = useCallback(
        (categoryId: string) => {
            // First check in regular categories
            let category = formState.categories.find(
                (cat: Category) => cat.id === categoryId
            )

            // If not found, check in wheel/tyre categories
            if (!category) {
                category = WHEEL_TYRE_CATEGORIES.find(
                    (cat: Category) => cat.id === categoryId
                )
            }

            setFormState((prev) => ({
                ...prev,
                selectedCategory: category || null,
                isVerified: false,
                verificationResult: null,
            }))
        },
        [formState.categories] // WHEEL_TYRE_CATEGORIES is constant
    )

    const fetchCategories = useCallback(
        async (searchTerm: string) => {
            try {
                setFormState((prev) => ({
                    ...prev,
                    isCategoriesLoading: true,
                    categoriesError: null,
                }))

                const data = await fetchCategoriesApi(searchTerm)
                setFormState((prev) => ({ ...prev, categories: data }))

                if (data.length > 0) {
                    handleCategoryChange(data[0].id)
                }
            } catch (error) {
                setFormState((prev) => ({
                    ...prev,
                    categoriesError:
                        error instanceof Error
                            ? error.message
                            : 'Failed to load categories',
                }))
                toast.error('Failed to load categories. Please try again.')
            } finally {
                setFormState((prev) => ({
                    ...prev,
                    isCategoriesLoading: false,
                }))
            }
        },
        [handleCategoryChange, setFormState] // toast and fetchCategoriesApi are constants
    )

    const fetchProductionYear = useCallback(async () => {
        if (!vehicle || !formState.partDescription) {
            setProductionYearInfo(null)
            setIsLoadingProductionYear(false)
            return
        }

        setIsLoadingProductionYear(true)
        try {
            const vehicleString = `${vehicle.dvlaMake} ${vehicle.dvlaModel} ${
                vehicle.modelSeries || ''
            } ${vehicle.dvlaYearOfManufacture}`
            const result = await askClaudeProductionYear(
                vehicleString.trim(),
                formState.partDescription
            )

            if (typeof result === 'string') {
                toast.error(result)
                setProductionYearInfo(null)
                return
            }

            setProductionYearInfo(result)

            setFormState((prev) => ({
                ...prev,
                productionYearInfo: result,
            }))
        } catch (error) {
            console.error('Error fetching production year:', error)
            toast.error('Failed to fetch vehicle production information')
            setProductionYearInfo(null)
        } finally {
            setIsLoadingProductionYear(false)
        }
    }, [vehicle, formState.partDescription, setFormState]) // toast and askClaudeProductionYear are constants

    const handlePhotosChange = (
        newPhotos: File[],
        newPreviews: string[],
        newUploadedUrls: string[],
        isUploading: boolean
    ) => {
        setFormState((prev) => ({
            ...prev,
            photos: newPhotos,
            photosPreviews: newPreviews,
            uploadedPhotoUrls: newUploadedUrls,
            isUploadingPhotos: isUploading,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleTitleParamChange = (param: string) => {
        const newParams = new Set(formState.selectedTitleParams)

        // Handle mutually exclusive parameters
        if (param === 'passenger' && newParams.has('driver')) {
            newParams.delete('driver')
        } else if (param === 'driver' && newParams.has('passenger')) {
            newParams.delete('passenger')
        }

        if (param === 'productionYears' && newParams.has('productionYearsFL')) {
            newParams.delete('productionYearsFL')
        } else if (
            param === 'productionYearsFL' &&
            newParams.has('productionYears')
        ) {
            newParams.delete('productionYears')
        }

        // Toggle the parameter
        if (newParams.has(param)) {
            newParams.delete(param)
        } else {
            newParams.add(param)
        }

        setFormState((prev) => ({ ...prev, selectedTitleParams: newParams }))
    }

    // Effect to update form state when vehicle changes
    useEffect(() => {
        if (vehicle) {
            // Only set brand/make from vehicle if not in wheels/tyres mode
            if (!vehicle.uniqueId?.startsWith('wheels-tyres')) {
                setFormState((prev) => ({
                    ...prev,
                    vehicle,
                    brand: vehicle.dvlaMake || '',
                    make: vehicle.dvlaMake || '',
                    wheelBrand: vehicle.dvlaMake || '',
                }))
            } else {
                setFormState((prev) => ({
                    ...prev,
                    vehicle,
                }))
            }

            // If we have both vehicle and part description, fetch categories only on initial vehicle set
            // Skip compatibility search for wheels/tyres mode
            if (formState.partDescription && !hasInitializedCategories) {
                if (!vehicle.uniqueId?.startsWith('wheels-tyres')) {
                    const searchTerm = `${vehicle.dvlaMake} ${formState.partDescription}`
                    fetchCategories(searchTerm)
                } else {
                    // For wheels/tyres, directly set the category without searching
                    const wheelTyreCategory = WHEEL_TYRE_CATEGORIES[0] // Default to first category (Wheels with Tyres)
                    handleCategoryChange(wheelTyreCategory.id)
                }
                setHasInitializedCategories(true)
            }
        }
    }, [
        vehicle,
        formState.partDescription,
        hasInitializedCategories,
        setFormState,
        fetchCategories,
        handleCategoryChange,
    ]) // WHEEL_TYRE_CATEGORIES is constant

    // Separate effect for production year - only fetch on initial vehicle set
    useEffect(() => {
        if (
            vehicle &&
            formState.partDescription &&
            !hasInitializedCategories &&
            !vehicle.uniqueId?.startsWith('wheels-tyres')
        ) {
            fetchProductionYear()
        }
    }, [
        vehicle,
        hasInitializedCategories,
        formState.partDescription,
        fetchProductionYear,
    ])

    useEffect(() => {
        if (!formState.vehicle || !formState.partDescription) return

        const currentVehicle = formState.vehicle
        const titleParts: string[] = []
        const genuineParam = TITLE_PARAMETERS.find(
            (param) => param.key === 'genuine'
        )

        // First, handle Genuine if selected
        if (
            formState.selectedTitleParams.has('genuine') &&
            genuineParam?.value
        ) {
            titleParts.push(genuineParam.value)
        }

        // Process each parameter (except Genuine which was handled above)
        TITLE_PARAMETERS.forEach((param) => {
            if (param.key === 'genuine') return // Skip Genuine as it's already handled

            // Handle split word parameters
            if (param.splitWords) {
                const value =
                    currentVehicle[param.key as keyof Car]?.toString() || ''
                const words = value.split(' ')
                words.forEach((word) => {
                    const wordKey = `${param.key}_${word}`
                    if (formState.selectedTitleParams.has(wordKey)) {
                        titleParts.push(word)
                    }
                })
            }
            // Handle regular parameters
            else if (formState.selectedTitleParams.has(param.key)) {
                if (param.isCustom) {
                    // First check if parameter has a predefined value
                    if (param.value) {
                        titleParts.push(param.value)
                    }
                    // Then handle production years cases
                    else if (formState.productionYearInfo) {
                        if (param.key === 'productionYears') {
                            titleParts.push(
                                `${formState.productionYearInfo.from}-${formState.productionYearInfo.to}`
                            )
                        } else if (
                            param.key === 'productionYearsFL' &&
                            formState.productionYearInfo.facelift
                        ) {
                            titleParts.push(
                                `${formState.productionYearInfo.from}-${formState.productionYearInfo.facelift}`
                            )
                        }
                    }
                } else {
                    const value = currentVehicle[param.key as keyof Car]
                    if (value) {
                        if (param.key === 'nomCC') {
                            titleParts.push(formatNomCC(value))
                        } else {
                            titleParts.push(value.toString().toUpperCase())
                        }
                    }
                }
            }
        })

        // Add part description at the end
        titleParts.push(formState.partDescription.toUpperCase())

        const fullTitle = titleParts.join(' ')

        if (fullTitle.length > 80) {
            shadcnToast({
                variant: 'destructive',
                title: 'Title Length Error',
                description:
                    "Title length exceeds eBay's 80 character limit. Please remove some parameters.",
            })
            const lastParam = Array.from(formState.selectedTitleParams).pop()
            if (lastParam) {
                const newParams = new Set(formState.selectedTitleParams)
                newParams.delete(lastParam)
                setFormState((prev) => ({
                    ...prev,
                    selectedTitleParams: newParams,
                    title: prev.title,
                }))
            }
            return
        }

        setFormState((prev) => ({ ...prev, title: fullTitle }))
    }, [
        formState.vehicle,
        formState.partDescription,
        formState.selectedTitleParams,
        formState.productionYearInfo,
        shadcnToast,
        setFormState,
    ]) // TITLE_PARAMETERS and formatNomCC are constants

    useEffect(() => {
        return () => {
            formState.photosPreviews.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [formState.photosPreviews])

    const resetForm = useCallback(() => {
        setFormState(initialFormState)
        setVehicle(null)
        setProductionYearInfo(null)
        setIsLoadingProductionYear(false)
        setHasInitializedCategories(false)
    }, [
        setFormState,
        setVehicle,
        setProductionYearInfo,
        setIsLoadingProductionYear,
        setHasInitializedCategories,
    ]) // initialFormState is constant

    const handleSubmit = useCallback(
        async (
            event: React.FormEvent<HTMLFormElement>,
            action: 'verify' | 'submit'
        ) => {
            event.preventDefault()
            setFormState((prev) => ({ ...prev, isLoading: true }))

            try {
                const formElement = event.currentTarget
                const formData = new FormData(formElement)
                const priceFromForm =
                    formElement.querySelector<HTMLInputElement>(
                        'input[name="price"]'
                    )?.value

                formData.append('action', action)
                formData.append('title', formState.title)
                formData.append('description', formState.title)
                formData.append('price', priceFromForm || formState.price)
                formData.append('condition', formState.selectedCondition)
                formData.append(
                    'conditionDescription',
                    formState.conditionDescription
                )
                formData.append('quantity', '1')
                formData.append(
                    'category',
                    formState.selectedCategory?.id || ''
                )
                formData.append(
                    'shippingProfileId',
                    formState.shippingProfileId || '240049979017'
                )

                formData.set(
                    'allowOffers',
                    formState.allowOffers ? 'true' : 'false'
                )

                if (formState.allowOffers && formState.minimumOfferPrice) {
                    formData.set(
                        'minimumOfferPrice',
                        formState.minimumOfferPrice
                    )
                }

                if (formState.partNumber)
                    formData.append('partNumber', formState.partNumber)
                if (formState.brand) formData.append('brand', formState.brand)
                if (formState.make) formData.append('make', formState.make)
                if (formState.paintCode)
                    formData.append('paintCode', formState.paintCode)
                if (formState.placement)
                    formData.append('placement', formState.placement)

                // Add wheel and tyre specifics if applicable
                if (formState.wheelDiameter)
                    formData.append('wheelDiameter', formState.wheelDiameter)
                if (formState.tyreWidth)
                    formData.append('tyreWidth', formState.tyreWidth)
                if (formState.aspectRatio)
                    formData.append('aspectRatio', formState.aspectRatio)
                if (formState.numberOfStuds)
                    formData.append('numberOfStuds', formState.numberOfStuds)
                if (formState.centreBore)
                    formData.append('centreBore', formState.centreBore)
                if (formState.packageQuantity)
                    formData.append(
                        'packageQuantity',
                        formState.packageQuantity
                    )
                if (formState.wheelMaterial)
                    formData.append('wheelMaterial', formState.wheelMaterial)
                if (formState.wheelBrand)
                    formData.append('wheelBrand', formState.wheelBrand)
                if (formState.pcd) formData.append('pcd', formState.pcd)

                // Add tyre-specific fields if applicable
                if (formState.tyreModel)
                    formData.append('tyreModel', formState.tyreModel)
                if (formState.treadDepth)
                    formData.append('treadDepth', formState.treadDepth)
                if (formState.dotDateCode)
                    formData.append('dotDateCode', formState.dotDateCode)
                if (formState.runFlat)
                    formData.append('runFlat', formState.runFlat)
                if (formState.unitQty)
                    formData.append('unitQty', formState.unitQty)

                // Add showCarInfo flag
                formData.append('showCarInfo', formState.showCarInfo.toString())

                // Use pre-uploaded photo URLs instead of uploading again
                formData.append(
                    'imageUrls',
                    JSON.stringify(formState.uploadedPhotoUrls)
                )

                if (formState.vehicle) {
                    formData.append(
                        'vehicleData',
                        JSON.stringify(formState.vehicle)
                    )
                }

                if (productionYearInfo) {
                    formData.append(
                        'productionYearInfo',
                        JSON.stringify(productionYearInfo)
                    )
                }

                const result = await submitListing(
                    formData,
                    action,
                    formState.vehicle
                )

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
        },
        [formState, productionYearInfo, setFormState, resetForm] // toast and submitListing are constants
    )

    return {
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
    }
}
