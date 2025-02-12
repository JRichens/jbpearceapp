'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FormState } from '../../types/listingTypes'
import { useEffect } from 'react'

interface PriceQuantityInputsProps {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    onPriceChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    onQuantityChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    onAllowOffersChange?: (checked: boolean) => void
    onMinimumOfferPriceChange?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    className?: string
}

export function PriceQuantityInputs({
    formState,
    setFormState,
    onPriceChange,
    onQuantityChange,
    onAllowOffersChange,
    onMinimumOfferPriceChange,
    className,
}: PriceQuantityInputsProps) {
    const calculateMinimumOfferPrice = (listingPrice: string) => {
        const numPrice = parseFloat(listingPrice)
        if (isNaN(numPrice)) return '0'

        // Calculate 85% of the price (15% reduction)
        const reducedPrice = numPrice * 0.85
        // Round to nearest £5
        const roundedPrice = Math.round(reducedPrice / 5) * 5
        return roundedPrice.toString()
    }

    useEffect(() => {
        if (formState.showMinimumOffer && onMinimumOfferPriceChange) {
            const minPrice = calculateMinimumOfferPrice(formState.price)
            onMinimumOfferPriceChange(minPrice)
        }
    }, [formState.price, formState.showMinimumOffer, onMinimumOfferPriceChange])

    const handleAllowOffersChange = (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            showMinimumOffer: checked,
            allowOffers: checked,
        }))

        if (onAllowOffersChange) {
            onAllowOffersChange(checked)
        }

        if (checked && onMinimumOfferPriceChange) {
            const minPrice = calculateMinimumOfferPrice(formState.price)
            onMinimumOfferPriceChange(minPrice)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-2 gap-4">
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
                        value={formState.price}
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
                        value={formState.quantity}
                        required
                        onChange={onQuantityChange}
                        className="text-xl"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="allowOffers"
                        name="allowOffers"
                        checked={formState.allowOffers}
                        onCheckedChange={handleAllowOffersChange}
                    />
                    <Label htmlFor="allowOffers">Allow offers</Label>
                </div>

                {formState.showMinimumOffer && (
                    <div className="space-y-2">
                        <Label htmlFor="minimumOfferPrice">
                            Auto Accept Price (£)
                        </Label>
                        <Input
                            id="minimumOfferPrice"
                            name="minimumOfferPrice"
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={formState.minimumOfferPrice}
                            onChange={onMinimumOfferPriceChange}
                            className="text-xl"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
