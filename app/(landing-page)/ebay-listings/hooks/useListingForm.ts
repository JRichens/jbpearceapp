'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useToast } from '@/components/ui/use-toast'
import { Car } from '@prisma/client'
import { FormState, initialFormState } from '../types/listingTypes'
import { fetchCategoriesApi, submitListing } from '../services/api'
import {
    TITLE_PARAMETERS,
    formatNomCC,
} from '../components/form/TitleParameters'
import { askClaudeProductionYear } from '@/actions/claude-ai/askClaudeProductionYear'

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

    // Effect to update form state when vehicle changes
    useEffect(() => {
        if (vehicle) {
            setFormState((prev) => ({
                ...prev,
                vehicle,
                brand: vehicle.dvlaMake || '',
                make: vehicle.dvlaMake || '',
            }))

            // If we have both vehicle and part description, fetch categories only on initial vehicle set
            if (formState.partDescription && !hasInitializedCategories) {
                const searchTerm = `${vehicle.dvlaMake} ${formState.partDescription}`
                fetchCategories(searchTerm)
                setHasInitializedCategories(true)
            }
        }
    }, [vehicle])

    // Separate effect for production year - only fetch on initial vehicle set
    useEffect(() => {
        if (vehicle && formState.partDescription && !hasInitializedCategories) {
            fetchProductionYear()
        }
    }, [vehicle, hasInitializedCategories])

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
    ])

    useEffect(() => {
        return () => {
            formState.photosPreviews.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [formState.photosPreviews])

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

    const fetchCategories = async (searchTerm: string) => {
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
            setFormState((prev) => ({ ...prev, isCategoriesLoading: false }))
        }
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

    const handlePhotosChange = (newPhotos: File[], newPreviews: string[]) => {
        setFormState((prev) => ({
            ...prev,
            photos: newPhotos,
            photosPreviews: newPreviews,
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
    }, [vehicle, formState.partDescription])

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
        action: 'verify' | 'submit'
    ) => {
        event.preventDefault()
        setFormState((prev) => ({ ...prev, isLoading: true }))

        try {
            const formElement = event.currentTarget
            const formData = new FormData(formElement)
            const priceFromForm = formElement.querySelector<HTMLInputElement>(
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
            formData.append('category', formState.selectedCategory?.id || '')
            formData.append(
                'shippingProfileId',
                formState.shippingProfileId || '240049979017'
            )

            formData.set(
                'allowOffers',
                formState.allowOffers ? 'true' : 'false'
            )

            if (formState.allowOffers && formState.minimumOfferPrice) {
                formData.set('minimumOfferPrice', formState.minimumOfferPrice)
            }

            if (formState.partNumber)
                formData.append('partNumber', formState.partNumber)
            if (formState.brand) formData.append('brand', formState.brand)
            if (formState.make) formData.append('make', formState.make)
            if (formState.paintCode)
                formData.append('paintCode', formState.paintCode)
            if (formState.placement)
                formData.append('placement', formState.placement)

            formState.photos.forEach((photo) => {
                formData.append('photos', photo)
            })

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
    }

    const resetForm = () => {
        setFormState(initialFormState)
        setVehicle(null)
        setProductionYearInfo(null)
        setIsLoadingProductionYear(false)
        setHasInitializedCategories(false)
    }

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
