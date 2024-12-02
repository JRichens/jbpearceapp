'use client'

import { useState } from 'react'
import {
    FormSectionProps,
    VehicleCompatibility,
} from '../../types/listingTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

export function CompatibilitySection({
    formState,
    setFormState,
}: FormSectionProps) {
    const [newCompatibility, setNewCompatibility] =
        useState<VehicleCompatibility>({
            kType: '',
            notes: '',
        })

    const addCompatibility = () => {
        if (newCompatibility.kType) {
            setFormState((prev) => ({
                ...prev,
                compatibilityList: [
                    ...prev.compatibilityList,
                    { ...newCompatibility },
                ],
                isVerified: false,
                verificationResult: null,
            }))
            setNewCompatibility({
                kType: '',
                notes: '',
            })
        }
    }

    const removeCompatibility = (index: number) => {
        setFormState((prev) => ({
            ...prev,
            compatibilityList: prev.compatibilityList.filter(
                (_, i) => i !== index
            ),
            isVerified: false,
            verificationResult: null,
        }))
    }

    // Auto-populate KType from vehicle engine code if available
    const autoPopulateFromVehicle = () => {
        if (formState.vehicle?.engineCode) {
            setNewCompatibility((prev) => ({
                ...prev,
                kType: formState.vehicle?.engineCode || '',
            }))
        }
    }

    return (
        <div className="space-y-4 bg-white shadow-sm rounded-md p-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
                Vehicle Compatibility
            </h3>

            {/* Existing compatibility list */}
            {formState.compatibilityList.length > 0 && (
                <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700">
                        Compatible Vehicles:
                    </h4>
                    {formState.compatibilityList.map((comp, index) => (
                        <div
                            key={index}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-md"
                        >
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    KType: {comp.kType}
                                </p>
                                {comp.notes && (
                                    <p className="text-sm text-gray-500">
                                        Notes: {comp.notes}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCompatibility(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new compatibility form */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="kType">KType Number*</Label>
                    <div className="flex gap-2">
                        <Input
                            id="kType"
                            value={newCompatibility.kType}
                            onChange={(e) =>
                                setNewCompatibility((prev) => ({
                                    ...prev,
                                    kType: e.target.value,
                                }))
                            }
                            placeholder="e.g., 27959"
                        />
                        {formState.vehicle?.engineCode && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={autoPopulateFromVehicle}
                            >
                                Use Engine Code
                            </Button>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                        id="notes"
                        value={newCompatibility.notes}
                        onChange={(e) =>
                            setNewCompatibility((prev) => ({
                                ...prev,
                                notes: e.target.value,
                            }))
                        }
                        placeholder="Additional compatibility notes"
                    />
                </div>
            </div>

            <Button
                type="button"
                onClick={addCompatibility}
                disabled={!newCompatibility.kType}
                className="w-full mt-4"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Compatible Vehicle
            </Button>

            <div className="mt-4 text-sm text-gray-500">
                <p>
                    * KType is a vehicle specification numbering system that
                    includes comprehensive vehicle details.
                </p>
                <p>
                    Example: KType 27959 corresponds to a specific vehicle make,
                    model, engine, and production period.
                </p>
            </div>
        </div>
    )
}
