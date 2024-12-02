'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormState } from '../../types/listingTypes'
import { capitalizeWords } from '../../utils/form.utils'
import { Form as RegForm } from '@/app/(landing-page)/_components/reg-form'
import { ProductionYearInfo } from './ProductionYearInfo'
import { Car } from '@prisma/client'
import {
    Dispatch,
    SetStateAction,
    useImperativeHandle,
    forwardRef,
} from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, X } from 'lucide-react'

interface PartDescriptionSectionProps {
    partDescriptionRef: React.RefObject<HTMLInputElement>
    vehicle: Car | null
    setVehicle: Dispatch<SetStateAction<Car | null>>
    setHasSearchedVehicle: Dispatch<SetStateAction<boolean>>
    productionYearInfo: any
    isLoadingProductionYear: boolean
    formState: FormState
    setFormState: Dispatch<SetStateAction<FormState>>
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    setPageNumber: Dispatch<SetStateAction<number>>
}

export interface PartDescriptionSectionRef {
    resetPartNumbers: () => void
}

export const PartDescriptionSection = forwardRef<
    PartDescriptionSectionRef,
    PartDescriptionSectionProps
>(
    (
        {
            formState,
            setFormState,
            onFormChange,
            partDescriptionRef,
            vehicle,
            setVehicle,
            setHasSearchedVehicle,
            productionYearInfo,
            isLoadingProductionYear,
            setPageNumber,
        },
        ref
    ) => {
        useImperativeHandle(ref, () => ({
            resetPartNumbers: () => {
                setFormState((prev: FormState) => ({
                    ...prev,
                    partNumbers: [''],
                    partNumber: '',
                }))
            },
        }))

        const handleVehicleChange = (newVehicle: Car | null) => {
            if (newVehicle?.dvlaMake) {
                setFormState((prevForm: FormState) => ({
                    ...prevForm,
                    brand: newVehicle.dvlaMake || '',
                    make: newVehicle.dvlaMake || '',
                }))
            }
            setVehicle(newVehicle)
            setHasSearchedVehicle(true)
        }

        const handlePartNumberChange = (index: number, value: string) => {
            const newPartNumbers = [...formState.partNumbers]
            newPartNumbers[index] = value.trim().toUpperCase()

            // Update formState with new part numbers array and combined string
            const combinedPartNumbers = newPartNumbers
                .filter((num: string) => num !== '')
                .join(', ')

            setFormState((prev: FormState) => ({
                ...prev,
                partNumbers: newPartNumbers,
                partNumber: combinedPartNumbers,
            }))

            // Create a synthetic event for onFormChange
            const syntheticEvent = {
                target: {
                    name: 'partNumber',
                    value: combinedPartNumbers,
                },
            } as React.ChangeEvent<HTMLInputElement>

            onFormChange(syntheticEvent)
        }

        const addPartNumberField = () => {
            setFormState((prev: FormState) => ({
                ...prev,
                partNumbers: [...prev.partNumbers, ''],
            }))
        }

        const removePartNumberField = (index: number) => {
            const newPartNumbers = formState.partNumbers.filter(
                (_: string, i: number) => i !== index
            )

            // Update formState with remaining part numbers
            const combinedPartNumbers = newPartNumbers
                .filter((num: string) => num !== '')
                .join(', ')

            setFormState((prev: FormState) => ({
                ...prev,
                partNumbers: newPartNumbers,
                partNumber: combinedPartNumbers,
            }))
        }

        const handleSearch = (partNumber: string) => {
            if (partNumber.trim()) {
                // Set a flag to indicate we're searching by part number
                setFormState((prev) => ({
                    ...prev,
                    selectedCategory: null,
                    searchByPartNumber: true, // Add this flag
                    activePartNumber: partNumber.trim(), // Store the active part number being searched
                }))
                setPageNumber(2)
            }
        }

        const showRegForm =
            formState.partDescription.trim() !== '' &&
            formState.partNumber.trim() !== ''

        return (
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="partDescription">Part Description *</Label>
                    <Input
                        ref={partDescriptionRef}
                        id="partDescription"
                        name="partDescription"
                        value={formState.partDescription}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const capitalizedValue = capitalizeWords(
                                e.target.value
                            )
                            const newEvent = {
                                ...e,
                                target: {
                                    ...e.target,
                                    value: capitalizedValue,
                                },
                            } as React.ChangeEvent<HTMLInputElement>

                            setFormState((prev: FormState) => ({
                                ...prev,
                                partDescription: capitalizedValue,
                                searchByPartNumber: false, // Reset the flag when description changes
                                activePartNumber: '', // Clear active part number
                            }))
                            onFormChange(newEvent)
                        }}
                        placeholder="Headlight, Wing Mirror, Bonnet..."
                        required
                        autoFocus
                        className="text-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="partNumber">Part Number</Label>
                    {formState.partNumbers.map(
                        (partNumber: string, index: number) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    id={`partNumber-${index}`}
                                    name={`partNumber-${index}`}
                                    value={partNumber}
                                    onChange={(e) =>
                                        handlePartNumberChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter manufacturer part number"
                                    className="text-xl"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleSearch(partNumber)}
                                    className="shrink-0"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                                {index === formState.partNumbers.length - 1 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={addPartNumberField}
                                        className="shrink-0"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            removePartNumberField(index)
                                        }
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )
                    )}
                </div>

                {showRegForm ? (
                    <RegForm
                        setVehicle={(value: SetStateAction<Car | null>) => {
                            if (typeof value === 'function') {
                                setVehicle(value)
                                setHasSearchedVehicle(true)
                            } else {
                                handleVehicleChange(value)
                            }
                        }}
                        autoFocus={false}
                    />
                ) : (
                    <p className="ml-2 text-sm text-muted-foreground">
                        Enter part description and part number
                    </p>
                )}

                {vehicle && (
                    <ProductionYearInfo
                        info={productionYearInfo}
                        isLoading={isLoadingProductionYear}
                        className="mt-4"
                        vehicle={vehicle}
                    />
                )}
            </div>
        )
    }
)

PartDescriptionSection.displayName = 'PartDescriptionSection'
