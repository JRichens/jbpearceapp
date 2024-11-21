'use client'

import { Car } from '@prisma/client'
import { Form as RegForm } from '@/app/(landing-page)/_components/reg-form'
import { Dispatch, SetStateAction } from 'react'

interface VehicleInfoProps {
    vehicle: Car | null
    setVehicle: Dispatch<SetStateAction<Car | null>>
    className?: string
    hideVehicleFound?: boolean
}

export function VehicleInfo({
    vehicle,
    setVehicle,
    className,
    hideVehicleFound = false,
}: VehicleInfoProps) {
    return (
        <div className={className}>
            <RegForm setVehicle={setVehicle} />
            {vehicle && !hideVehicleFound && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                        Vehicle found: {vehicle.dvlaMake} {vehicle.dvlaModel}{' '}
                        {vehicle.dvlaYearOfManufacture}{' '}
                        {vehicle?.nomCC?.includes('.')
                            ? vehicle?.nomCC
                            : `${vehicle?.nomCC ?? '0'}.0`}{' '}
                        {vehicle.fuelType} {vehicle.colourCurrent}{' '}
                    </p>
                </div>
            )}
        </div>
    )
}
