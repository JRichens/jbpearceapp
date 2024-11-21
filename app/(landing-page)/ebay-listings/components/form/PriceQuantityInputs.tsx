'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PriceQuantityInputsProps {
    onPriceChange: () => void
    onQuantityChange: () => void
    className?: string
}

export function PriceQuantityInputs({
    onPriceChange,
    onQuantityChange,
    className,
}: PriceQuantityInputsProps) {
    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            <div className="space-y-2">
                <Label htmlFor="price">Price (£) *</Label>
                <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    onChange={onPriceChange}
                    className="text-xl"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="1"
                    min="1"
                    defaultValue="1"
                    required
                    onChange={onQuantityChange}
                    className="text-xl"
                />
            </div>
        </div>
    )
}
