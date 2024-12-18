'use client'

import { CONDITIONS } from '../../types/listingTypes'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChangeEvent, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ConditionSelectProps {
    selectedCondition: string
    onConditionChange: (value: string) => void
    onDescriptionChange: (
        e: string | ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void
    className?: string
}

const CONDITION_DESCRIPTIONS = [
    { id: '0', description: '✅ Good condition' },
    { id: '1', description: '✅ Good working condition' },
    {
        id: '2',
        description:
            '☑️ Reasonable condition for age. Some marks. Please see photos.',
    },
    {
        id: '3',
        description:
            '☑️ Reasonable condition for age. Some minor scratches. Please see photos.',
    },
    {
        id: '4',
        description:
            '☑️ Reasonable condition for age. Some minor scratches and dents. Please see photos.',
    },
    { id: '5', description: '⚠️ Some scratches and dents. Please see photos' },
    { id: '6', description: '⚠️ Damaged. Please see photos' },
    {
        id: '7',
        description: '⚠️ Damaged, but still working. Please see photos',
    },
]

export function ConditionSelect({
    selectedCondition,
    onConditionChange,
    onDescriptionChange,
    className,
}: ConditionSelectProps) {
    const [isConditionOpen, setIsConditionOpen] = useState(false)
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
    const [selectedDescription, setSelectedDescription] = useState<string>('')

    const selectedConditionOption = CONDITIONS.find(
        (condition) => condition.id === selectedCondition
    )

    const handleDescriptionChange = (description: string) => {
        setSelectedDescription(description)
        const event = {
            target: {
                name: 'conditionDescription',
                value: description,
            },
        } as ChangeEvent<HTMLSelectElement>
        onDescriptionChange(event)
        setIsDescriptionOpen(false)
    }

    return (
        <div className={className}>
            <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={isConditionOpen}
                        className="w-full justify-between text-xl bg-white"
                        onClick={() => setIsConditionOpen(true)}
                    >
                        <span className="truncate">
                            {selectedConditionOption?.name ||
                                'Select condition'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>

                    <Dialog
                        open={isConditionOpen}
                        onOpenChange={setIsConditionOpen}
                    >
                        <DialogContent className="p-0 w-[90%] max-w-[400px] [&>button]:hidden">
                            <div className="py-1">
                                {CONDITIONS.map((condition) => (
                                    <button
                                        key={condition.id}
                                        type="button"
                                        className={cn(
                                            'w-full px-4 py-3 text-left text-xl hover:bg-gray-200',
                                            selectedCondition ===
                                                condition.id && 'bg-gray-100'
                                        )}
                                        onClick={() => {
                                            onConditionChange(condition.id)
                                            setIsConditionOpen(false)
                                            setSelectedDescription('')
                                        }}
                                    >
                                        {condition.name}
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <select
                        name="condition"
                        required
                        value={selectedCondition}
                        onChange={(e) => onConditionChange(e.target.value)}
                        className="sr-only"
                    >
                        <option value="">Select condition</option>
                        {CONDITIONS.map((condition) => (
                            <option key={condition.id} value={condition.id}>
                                {condition.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {(selectedCondition === 'Used' ||
                selectedCondition === 'For parts or not working') && (
                <div className="space-y-2 mt-4">
                    <Label htmlFor="conditionDescription">
                        Condition Description *
                    </Label>
                    <div className="relative">
                        <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={isDescriptionOpen}
                            className="w-full justify-between text-xl bg-white max-w-full overflow-hidden"
                            onClick={() => setIsDescriptionOpen(true)}
                        >
                            <div className="flex items-center justify-between w-full max-w-full overflow-hidden">
                                <span className="truncate max-w-[calc(100%-2rem)]">
                                    {selectedDescription || 'Please select...'}
                                </span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </div>
                        </Button>

                        <Dialog
                            open={isDescriptionOpen}
                            onOpenChange={setIsDescriptionOpen}
                        >
                            <DialogContent className="p-0 w-[90%] max-w-[400px] [&>button]:hidden">
                                <div className="py-1">
                                    {CONDITION_DESCRIPTIONS.map(
                                        (condition, index) => (
                                            <button
                                                key={condition.id}
                                                type="button"
                                                className={cn(
                                                    'w-full px-4 py-3 text-left text-xl hover:bg-gray-200 break-words whitespace-normal',
                                                    selectedDescription ===
                                                        condition.description &&
                                                        'bg-gray-100',
                                                    index !==
                                                        CONDITION_DESCRIPTIONS.length -
                                                            1 &&
                                                        'border-b border-gray-100'
                                                )}
                                                onClick={() =>
                                                    handleDescriptionChange(
                                                        condition.description
                                                    )
                                                }
                                            >
                                                <div className="break-words whitespace-normal">
                                                    {condition.description}
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <select
                            name="conditionDescription"
                            required
                            value={selectedDescription}
                            onChange={(e) =>
                                handleDescriptionChange(e.target.value)
                            }
                            className="sr-only"
                        >
                            <option value="">Please select...</option>
                            {CONDITION_DESCRIPTIONS.map((condition) => (
                                <option
                                    key={condition.id}
                                    value={condition.description}
                                >
                                    {condition.description}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
