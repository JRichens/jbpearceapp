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

            // If we have a part description, fetch production year
            if (formState.partDescription) {
                fetchProductionYear()
            }
        }
    }, [vehicle]) // eslint-disable-line react-hooks/exhaustive-deps

    // Effect for title generation with length validation
    useEffect(() => {
        if (formState.vehicle && formState.partDescription) {
            // Get all selected parameters except passenger, driver, and colour
            const regularTitleParts = TITLE_PARAMETERS.filter(
                (param) =>
                    formState.selectedTitleParams.has(param.key) &&
                    param.key !== 'passenger' &&
                    param.key !== 'driver' &&
                    param.key !== 'colourCurrent'
            )
                .map((param) => {
                    if (param.isCustom) {
                        if (param.key === 'genuine') return param.value
                        if (formState.productionYearInfo) {
                            if (param.key === 'productionYears') {
                                return `${formState.productionYearInfo.from} ${formState.productionYearInfo.to}`
                            }
                            if (
                                param.key === 'productionYearsFL' &&
                                formState.productionYearInfo.facelift
                            ) {
                                return `${formState.productionYearInfo.from} ${formState.productionYearInfo.facelift}`
                            }
                        }
                        return null
                    }
                    const value = formState.vehicle![param.key as keyof Car]
                    if (param.key === 'nomCC' && value) {
                        return formatNomCC(value)
                    }
                    return value
                })
                .filter(Boolean)

            // Get passenger/driver value if selected
            const positionParam = TITLE_PARAMETERS.find(
                (param) =>
                    (param.key === 'passenger' || param.key === 'driver') &&
                    formState.selectedTitleParams.has(param.key)
            )
            const positionValue = positionParam?.value

            // Get colour if selected
            const colourValue = formState.selectedTitleParams.has(
                'colourCurrent'
            )
                ? formState.vehicle.colourCurrent
                : null

            // Combine all parts in the desired order
            const allParts = [
                ...regularTitleParts,
                positionValue,
                colourValue,
                formState.partDescription,
            ].filter(Boolean)

            const fullTitle = allParts.join(' ')

            // Check if title length exceeds 80 characters
            if (fullTitle.length > 80) {
                shadcnToast({
                    variant: 'destructive',
                    title: 'Title Length Error',
                    description:
                        "Title length exceeds eBay's 80 character limit. Please remove some parameters.",
                })
                // Remove the last added parameter
                const lastParam = Array.from(
                    formState.selectedTitleParams
                ).pop()
                if (lastParam) {
                    const newParams = new Set(formState.selectedTitleParams)
                    newParams.delete(lastParam)
                    setFormState((prev) => ({
                        ...prev,
                        selectedTitleParams: newParams,
                        title: prev.title, // Keep the previous valid title
                    }))
                }
                return
            }

            setFormState((prev) => ({ ...prev, title: fullTitle }))
        }
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
            // Handle direct value (from shipping profile select)
            setFormState((prev) => ({
                ...prev,
                shippingProfileId: e,
                isVerified: false,
                verificationResult: null,
            }))
        } else if (e?.target) {
            // Handle event object
            const { name, value } = e.target
            setFormState((prev) => ({
                ...prev,
                [name]: value,
                isVerified: false,
                verificationResult: null,
            }))
        } else {
            // Handle general form state reset
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

        // Handle passenger/driver mutual exclusivity
        if (param === 'passenger' && newParams.has('driver')) {
            newParams.delete('driver')
        } else if (param === 'driver' && newParams.has('passenger')) {
            newParams.delete('passenger')
        }

        // Handle production years mutual exclusivity
        if (param === 'productionYears' && newParams.has('productionYearsFL')) {
            newParams.delete('productionYearsFL')
        } else if (
            param === 'productionYearsFL' &&
            newParams.has('productionYears')
        ) {
            newParams.delete('productionYears')
        }

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

            // Update form state in a single operation
            setFormState((prev) => {
                const newParams = new Set(prev.selectedTitleParams)
                if (result.facelift) {
                    newParams.add('productionYearsFL')
                } else {
                    newParams.add('productionYears')
                }
                return {
                    ...prev,
                    selectedTitleParams: newParams,
                    productionYearInfo: result,
                }
            })

            // After successful production year fetch, fetch categories
            const searchTerm = `${vehicle.dvlaMake} ${formState.partDescription}`
            await fetchCategories(searchTerm)
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

            // Add action
            formData.append('action', action)

            // Add required fields
            formData.append('title', formState.title)
            formData.append('description', formState.title) // Use title as description
            formData.append('price', priceFromForm || formState.price)
            formData.append('condition', formState.selectedCondition)
            formData.append('quantity', '1') // Default quantity
            formData.append('category', formState.selectedCategory?.id || '')
            formData.append(
                'shippingProfileId',
                formState.shippingProfileId || '240049979017'
            ) // Use selected profile or default to Express Delivery

            // Add optional fields
            if (formState.partNumber)
                formData.append('partNumber', formState.partNumber)
            if (formState.brand) formData.append('brand', formState.brand)
            if (formState.make) formData.append('make', formState.make)
            if (formState.paintCode)
                formData.append('paintCode', formState.paintCode)
            if (formState.placement)
                formData.append('placement', formState.placement)

            // Add photos
            formState.photos.forEach((photo) => {
                formData.append('photos', photo)
            })

            // Add vehicle data
            if (formState.vehicle) {
                formData.append(
                    'vehicleData',
                    JSON.stringify(formState.vehicle)
                )
            }

            // Add production year info
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
        // Reset all state to initial values
        setFormState(initialFormState)
        setVehicle(null)
        setProductionYearInfo(null)
        setIsLoadingProductionYear(false)
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