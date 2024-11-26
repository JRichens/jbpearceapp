'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FormSectionProps } from '../../types/form.types'
import { capitalizeWords, PLACEMENT_OPTIONS } from '../../utils/form.utils'
import { useState } from 'react'

interface DetailsSectionProps extends FormSectionProps {
    selectedPlacements: string[]
    onPlacementChange: (value: string) => void
}

export function DetailsSection({
    formState,
    setFormState,
    onFormChange,
    selectedPlacements,
    onPlacementChange,
}: DetailsSectionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input
                    id="partNumber"
                    name="partNumber"
                    value={formState.partNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const transformedValue = e.target.value
                            .trim()
                            .toUpperCase()
                        const newEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: transformedValue,
                            },
                        } as React.ChangeEvent<HTMLInputElement>

                        setFormState((prev) => ({
                            ...prev,
                            partNumber: transformedValue,
                        }))
                        onFormChange(newEvent)
                    }}
                    placeholder="Enter manufacturer part number"
                    className="text-xl"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                    id="make"
                    name="make"
                    value={formState.make}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const transformedValue = capitalizeWords(
                            e.target.value.trim()
                        )
                        const newEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: transformedValue,
                            },
                        } as React.ChangeEvent<HTMLInputElement>

                        setFormState((prev) => ({
                            ...prev,
                            make: transformedValue,
                            brand: transformedValue,
                        }))
                        onFormChange(newEvent)
                    }}
                    placeholder="Enter make"
                    className="text-xl"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="paintCode">Paint Code</Label>
                <Input
                    id="paintCode"
                    name="paintCode"
                    value={formState.paintCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const transformedValue = e.target.value
                            .trim()
                            .toUpperCase()
                        const newEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: transformedValue,
                            },
                        } as React.ChangeEvent<HTMLInputElement>

                        setFormState((prev) => ({
                            ...prev,
                            paintCode: transformedValue,
                        }))
                        onFormChange(newEvent)
                    }}
                    placeholder="Enter paint code"
                    className="text-xl"
                />
            </div>

            <div className="space-y-2">
                <Label>Placement on Vehicle (Select up to 2)</Label>
                <div className="flex flex-wrap gap-2">
                    {PLACEMENT_OPTIONS.map((option) => (
                        <Button
                            key={option}
                            type="button"
                            variant={
                                selectedPlacements.includes(option)
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => onPlacementChange(option)}
                            className="flex-1"
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
