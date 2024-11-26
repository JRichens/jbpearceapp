'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSectionProps } from '../../types/form.types'
import { capitalizeWords } from '../../utils/form.utils'
import { Form as RegForm } from '@/app/(landing-page)/_components/reg-form'
import { ProductionYearInfo } from './ProductionYearInfo'
import { Car } from '@prisma/client'
import { Dispatch, SetStateAction } from 'react'

interface PartDescriptionSectionProps extends FormSectionProps {
    partDescriptionRef: React.RefObject<HTMLInputElement>
    vehicle: Car | null
    setVehicle: Dispatch<SetStateAction<Car | null>>
    productionYearInfo: any
    isLoadingProductionYear: boolean
}

export function PartDescriptionSection({
    formState,
    setFormState,
    onFormChange,
    partDescriptionRef,
    vehicle,
    setVehicle,
    productionYearInfo,
    isLoadingProductionYear,
}: PartDescriptionSectionProps) {
    const handleVehicleChange = (newVehicle: Car | null) => {
        setVehicle((prev) => {
            // If new vehicle details are available, update form state
            if (newVehicle?.dvlaMake) {
                setFormState((prevForm) => ({
                    ...prevForm,
                    brand: newVehicle.dvlaMake || '',
                    make: newVehicle.dvlaMake || '',
                }))
            }
            return newVehicle
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="partDescription">Part Description *</Label>
                <Input
                    ref={partDescriptionRef}
                    id="partDescription"
                    name="partDescription"
                    value={formState.partDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const capitalizedValue = capitalizeWords(e.target.value)
                        // Create a new event with the capitalized value
                        const newEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: capitalizedValue,
                            },
                        } as React.ChangeEvent<HTMLInputElement>

                        setFormState((prev) => ({
                            ...prev,
                            partDescription: capitalizedValue,
                        }))
                        onFormChange(newEvent)
                    }}
                    placeholder="Headlight, Wing Mirror, Bonnet..."
                    required
                    autoFocus
                    className="text-xl"
                />
            </div>

            <RegForm setVehicle={setVehicle} />

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
