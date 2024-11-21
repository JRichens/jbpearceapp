'use client'

import { Car } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ListingDescriptionProps {
    vehicle: Car | null
    partDescription: string
    onChange: () => void
    className?: string
}

export function ListingDescription({
    vehicle,
    partDescription,
    onChange,
    className = '',
}: ListingDescriptionProps) {
    return (
        <div className={className}>
            <Label htmlFor="description">Description *</Label>
            <Textarea
                id="description"
                name="description"
                placeholder="Enter item description"
                className="min-h-[100px] text-xl"
                required
                onChange={onChange}
                defaultValue={
                    vehicle
                        ? `${vehicle.dvlaMake} ${vehicle.dvlaModel} ${vehicle.dvlaYearOfManufacture}
Engine Size: ${vehicle.engineCapacity}cc
Fuel Type: ${vehicle.fuelType}
Transmission: ${vehicle.transmission}
Vehicle Category: ${vehicle.vehicleCategory}
Colour: ${vehicle.colourCurrent}
Part: ${partDescription}`
                        : ''
                }
            />
        </div>
    )
}
