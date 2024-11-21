'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ShippingProfileSelectProps {
    onProfileChange: () => void
    className?: string
}

export function ShippingProfileSelect({
    onProfileChange,
    className,
}: ShippingProfileSelectProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="shippingProfileId">Shipping Profile *</Label>
            <Select
                name="shippingProfileId"
                required
                defaultValue="Express Delivery"
                onValueChange={onProfileChange}
            >
                <SelectTrigger className="text-xl">
                    <SelectValue
                        placeholder="Express Delivery"
                        className="text-xl"
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Express Delivery" className="text-xl">
                        Express Delivery
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
