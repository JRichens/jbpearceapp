'use client'

import { CONDITIONS } from '../../types/listingTypes'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChangeEvent } from 'react'

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
    return (
        <div className={className}>
            <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select
                    name="condition"
                    required
                    defaultValue="Used"
                    onValueChange={onConditionChange}
                >
                    <SelectTrigger className="text-xl">
                        <SelectValue
                            placeholder="Select condition"
                            className="text-xl"
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {CONDITIONS.map((condition) => (
                            <SelectItem
                                key={condition.id}
                                value={condition.id}
                                className={cn(
                                    'text-xl',
                                    'focus:bg-gray-50 focus:text-gray-900',
                                    'data-[state=checked]:bg-gray-50'
                                )}
                            >
                                {condition.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {(selectedCondition === 'Used' ||
                selectedCondition === 'For parts or not working') && (
                <div className="space-y-2 mt-4">
                    <Label htmlFor="conditionDescription">
                        Condition Description *
                    </Label>
                    <Select
                        name="conditionDescription"
                        required
                        onValueChange={(value: string) => {
                            const event = {
                                target: {
                                    name: 'conditionDescription',
                                    value: value,
                                },
                            } as ChangeEvent<HTMLSelectElement>
                            onDescriptionChange(event)
                        }}
                    >
                        <SelectTrigger className="text-xl">
                            <SelectValue
                                placeholder="Please select..."
                                className="text-xl"
                            />
                        </SelectTrigger>
                        <SelectContent className="max-w-[90vw] min-w-[90vw] md:min-w-[400px] md:max-w-[400px]">
                            {CONDITION_DESCRIPTIONS.map((condition, index) => (
                                <SelectItem
                                    key={condition.id}
                                    value={condition.description}
                                    className={cn(
                                        'text-xl break-words whitespace-normal py-3 px-3',
                                        'hover:bg-gray-50 transition-colors',
                                        'focus:bg-gray-50 focus:text-gray-900',
                                        'data-[state=checked]:bg-gray-50',
                                        index !==
                                            CONDITION_DESCRIPTIONS.length - 1 &&
                                            'border-b border-gray-100'
                                    )}
                                >
                                    {condition.description}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
