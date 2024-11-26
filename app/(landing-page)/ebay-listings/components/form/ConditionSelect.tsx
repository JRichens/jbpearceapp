'use client'

import { CONDITIONS } from '../../types/listingTypes'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ConditionSelectProps {
    selectedCondition: string
    onConditionChange: (value: string) => void
    onDescriptionChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    className?: string
}

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
                                className="text-xl"
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
                    <Input
                        id="conditionDescription"
                        name="conditionDescription"
                        defaultValue="✅ Good condition"
                        className="text-xl"
                        required
                        onChange={(e) => onDescriptionChange(e)}
                    />
                </div>
            )}
        </div>
    )
}
