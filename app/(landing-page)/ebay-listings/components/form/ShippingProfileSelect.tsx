'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FormState } from '../../types/listingTypes'
import { Dispatch, SetStateAction, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShippingProfileSelectProps {
    formState: FormState
    setFormState: Dispatch<SetStateAction<FormState>>
    onProfileChange: (value: string) => void
    className?: string
}

const shippingOptions = [
    { id: '240049979017', label: 'Express Delivery' },
    { id: '241635992017', label: 'Courier 3-5 Work/Days' },
]

export function ShippingProfileSelect({
    formState,
    setFormState,
    onProfileChange,
    className,
}: ShippingProfileSelectProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (value: string) => {
        setFormState((prev) => ({
            ...prev,
            shippingProfileId: value,
        }))
        onProfileChange(value)
        setIsOpen(false)
    }

    const selectedOption = shippingOptions.find(
        (option) => option.id === formState.shippingProfileId
    )

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="shippingProfileId">Postage Profile *</Label>
            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between text-xl bg-white"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="truncate">
                        {selectedOption?.label || 'Please select...'}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="p-0 w-[90%] max-w-[400px] [&>button]:hidden">
                        <div className="py-1">
                            {shippingOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={cn(
                                        'w-full px-4 py-3 text-left text-xl hover:bg-gray-200',
                                        formState.shippingProfileId ===
                                            option.id && 'bg-gray-100'
                                    )}
                                    onClick={() => handleSelect(option.id)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <select
                    name="shippingProfileId"
                    required
                    value={formState.shippingProfileId || ''}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="sr-only"
                >
                    <option value="">Please select...</option>
                    {shippingOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
