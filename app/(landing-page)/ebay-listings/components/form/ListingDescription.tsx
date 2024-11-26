'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Car } from '@prisma/client'

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
    const [description, setDescription] = useState<string>('')

    const generateDefaultDescription = () => {
        if (!vehicle) return ''
        // Only use the part description since vehicle details will be handled by the template
        return partDescription
    }

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setDescription(e.target.value)
        onChange()
    }

    return (
        <div className={className}>
            <Label htmlFor="description">Description</Label>
            <Textarea
                id="description"
                name="description"
                value={description || generateDefaultDescription()}
                onChange={handleDescriptionChange}
                placeholder="Enter detailed item description"
                required
                className="min-h-[200px]"
            />
        </div>
    )
}
