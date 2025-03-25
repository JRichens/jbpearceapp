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
    useRef,
    useEffect,
    useState,
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
        const selectionRef = useRef<{
            start: number | null
            end: number | null
        }>({
            start: null,
            end: null,
        })

        // Track which part number fields have NA selected
        const [naSelected, setNaSelected] = useState<boolean[]>([false])

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
            if (newVehicle) {
                // Only set brand and make if it's not a wheels/tyres vehicle
                if (!newVehicle.uniqueId?.startsWith('wheels-tyres')) {
                    setFormState((prevForm: FormState) => ({
                        ...prevForm,
                        brand: newVehicle.dvlaMake || '',
                        make: newVehicle.dvlaMake || '',
                    }))
                } else {
                    // For wheels/tyres, don't set any brand
                    setFormState((prevForm: FormState) => ({
                        ...prevForm,
                        brand: '',
                        make: '',
                    }))
                }
            }
            setVehicle(newVehicle)
            setHasSearchedVehicle(true)
        }

        const handlePartDescriptionChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            const input = e.target
            const start = input.selectionStart
            const end = input.selectionEnd

            // Store selection position
            selectionRef.current = { start, end }

            const capitalizedValue = capitalizeWords(input.value)
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
                searchByPartNumber: false,
                activePartNumber: '',
            }))
            onFormChange(newEvent)
        }

        // Restore cursor position after state update
        useEffect(() => {
            if (
                partDescriptionRef.current &&
                selectionRef.current.start !== null &&
                selectionRef.current.end !== null
            ) {
                partDescriptionRef.current.setSelectionRange(
                    selectionRef.current.start,
                    selectionRef.current.end
                )
            }
        }, [formState.partDescription, partDescriptionRef])

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
            // Add a new entry to naSelected state
            setNaSelected((prev) => [...prev, false])
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

            // Update naSelected state by removing the corresponding entry
            setNaSelected((prev) => prev.filter((_, i) => i !== index))
        }

        // Toggle NA for a part number field
        const toggleNa = (index: number) => {
            const newNaSelected = [...naSelected]
            newNaSelected[index] = !newNaSelected[index]
            setNaSelected(newNaSelected)

            // If toggling to NA, set the value to 'NA'
            // If toggling off NA, clear the value
            const newValue = newNaSelected[index] ? 'NA' : ''
            handlePartNumberChange(index, newValue)
        }

        const handleSearch = (partNumber: string) => {
            if (partNumber.trim()) {
                // Set a flag to indicate we're searching by part number
                setFormState((prev) => ({
                    ...prev,
                    selectedCategory: null,
                    searchByPartNumber: true,
                    activePartNumber: partNumber.trim(),
                }))
                // Only trigger compatibility search if not in wheels/tyres mode
                if (!vehicle?.uniqueId?.startsWith('wheels-tyres')) {
                    setPageNumber(2)
                }
            }
        }

        const createDefaultVehicle = (): Car => ({
            uniqueId: 'wheels-tyres',
            reg: 'N/A',
            vinOriginalDvla: 'N/A',
            dvlaMake: 'N/A',
            dvlaModel: 'N/A',
            dvlaYearOfManufacture: 'N/A',
            modelSeries: 'N/A',
            modelVariant: 'N/A',
            nomCC: 'N/A',
            colourCurrent: 'N/A',
            originCountry: 'N/A',
            weight: 'N/A',
            euroStatus: 'N/A',
            engineCode: 'N/A',
            engineCapacity: 'N/A',
            noCylinders: 'N/A',
            fuelType: 'N/A',
            transmission: 'N/A',
            aspiration: 'N/A',
            maxBHP: 'N/A',
            maxTorque: 'N/A',
            driveType: 'N/A',
            gears: 'N/A',
            vehicleCategory: 'N/A',
            imageUrl: null,
            exportVehicle: false,
            addedToExport: null,
            breakingVehicle: false,
            addedToBreaking: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            enginePrice: 0,
            paintCode: 'N/A',
        })

        // Only show RegForm if we have part description and number, and we're not in wheels/tyres mode
        const showRegForm =
            formState.partDescription.trim() !== '' &&
            formState.partNumber.trim() !== '' &&
            !vehicle?.uniqueId?.startsWith('wheels-tyres')

        return (
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="partDescription">Part Description *</Label>
                    <Input
                        ref={partDescriptionRef}
                        id="partDescription"
                        name="partDescription"
                        value={formState.partDescription}
                        onChange={handlePartDescriptionChange}
                        placeholder="Headlight, Wing Mirror, Bonnet..."
                        required
                        autoFocus
                        autoComplete="on"
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
                                    autoComplete="on"
                                    className={`text-xl ${
                                        naSelected[index]
                                            ? 'bg-gray-100 text-gray-500'
                                            : ''
                                    }`}
                                    disabled={naSelected[index]}
                                />
                                {/* NA button */}
                                <Button
                                    type="button"
                                    variant={
                                        naSelected[index]
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="icon"
                                    onClick={() => toggleNa(index)}
                                    className="shrink-0"
                                >
                                    <span className="text-xs font-medium">
                                        NA
                                    </span>
                                </Button>

                                {partNumber.trim() !== '' &&
                                    !['NA', 'N/A'].includes(
                                        partNumber.trim().toUpperCase()
                                    ) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                handleSearch(partNumber)
                                            }
                                            className="shrink-0"
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    )}

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

                <div className="space-y-4">
                    {/* Show Wheels/Tyres button if part description contains 'alloy', 'wheel', or 'tyre' and no vehicle is selected */}
                    {formState.partDescription.trim() !== '' &&
                        !vehicle &&
                        (formState.partDescription
                            .toLowerCase()
                            .includes('alloy') ||
                            formState.partDescription
                                .toLowerCase()
                                .includes('wheel') ||
                            formState.partDescription
                                .toLowerCase()
                                .includes('tyre')) && (
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    handleVehicleChange(createDefaultVehicle())
                                    setFormState((prev) => ({
                                        ...prev,
                                        showCarInfo: false, // Ensure car info is hidden by default
                                        partNumbers: ['NA'], // Set part number to NA
                                        partNumber: 'NA',
                                        tyreModel: '', // Initialize tyreModel as empty string
                                        brand: '', // Initialize brand as empty string
                                        dotDateCode: '', // Initialize dotDateCode as empty string
                                    }))
                                }}
                                className="w-full"
                            >
                                Wheels / Tyres
                            </Button>
                        )}

                    {showRegForm && (
                        <div>
                            <RegForm
                                setVehicle={(
                                    value: SetStateAction<Car | null>
                                ) => {
                                    if (typeof value === 'function') {
                                        setVehicle(value)
                                        setHasSearchedVehicle(true)
                                    } else {
                                        handleVehicleChange(value)
                                    }
                                }}
                                autoFocus={false}
                            />
                        </div>
                    )}

                    {!showRegForm && !vehicle && (
                        <p className="ml-2 text-sm text-muted-foreground">
                            Enter part description and part number
                        </p>
                    )}
                </div>

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
