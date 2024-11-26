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
    onProfileChange: (value: string) => void
    className?: string
}

export function ShippingProfileSelect({
    onProfileChange,
    className,
}: ShippingProfileSelectProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="shippingProfileId">Postage Profile *</Label>
            <Select
                name="shippingProfileId"
                required
                onValueChange={(value) => onProfileChange(value)}
            >
                <SelectTrigger className="text-xl">
                    <SelectValue
                        placeholder="Select a postage method"
                        className="text-xl"
                    />
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
