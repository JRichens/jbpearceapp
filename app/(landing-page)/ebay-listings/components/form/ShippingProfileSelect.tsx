'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormState } from '../../types/listingTypes'
import { Dispatch, SetStateAction } from 'react'

interface ShippingProfileSelectProps {
    formState: FormState
    setFormState: Dispatch<SetStateAction<FormState>>
    onProfileChange: (value: string) => void
    className?: string
}

export function ShippingProfileSelect({
    formState,
    setFormState,
    onProfileChange,
    className,
}: ShippingProfileSelectProps) {
    const handleProfileChange = (value: string) => {
        setFormState((prev) => ({
            ...prev,
            shippingProfileId: value,
        }))
        onProfileChange(value)
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="shippingProfileId">Postage Profile *</Label>
            <Select
                name="shippingProfileId"
                required
                value={formState.shippingProfileId || undefined}
                onValueChange={handleProfileChange}
            >
                <SelectTrigger className="text-xl">
                    <SelectValue placeholder="Please select..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="240049979017" className="text-xl">
                        Express Delivery
                    </SelectItem>
                    <SelectItem value="241635992017" className="text-xl">
                        Courier 3-5 Work/Days
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
