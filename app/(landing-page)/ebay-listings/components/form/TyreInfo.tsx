'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormState } from '../../types/listingTypes'

interface TyreInfoProps {
    formState: FormState
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
}

export function TyreInfo({
    formState,
    onFormChange,
    setFormState,
}: TyreInfoProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tyre Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                        id="brand"
                        name="brand"
                        type="text"
                        value={formState.brand}
                        onChange={onFormChange}
                        placeholder="e.g., Michelin"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tyreModel">Model</Label>
                    <Input
                        id="tyreModel"
                        name="tyreModel"
                        type="text"
                        value={formState.tyreModel}
                        onChange={onFormChange}
                        placeholder="e.g., Pilot Sport 4"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="treadDepth">Tread Depth</Label>
                    <Input
                        id="treadDepth"
                        name="treadDepth"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formState.treadDepth}
                        onChange={onFormChange}
                        placeholder="e.g., 6.5"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Required (in mm)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dotDateCode">DOT Date Code</Label>
                    <Input
                        id="dotDateCode"
                        name="dotDateCode"
                        type="text"
                        pattern="\d{4}"
                        maxLength={4}
                        value={formState.dotDateCode}
                        onChange={onFormChange}
                        placeholder="e.g., 2023"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Required (4 digits)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="runFlat">Run Flat</Label>
                    <Select
                        name="runFlat"
                        value={formState.runFlat}
                        onValueChange={(value) => {
                            const event = {
                                target: {
                                    name: 'runFlat',
                                    value,
                                },
                            } as React.ChangeEvent<HTMLSelectElement>
                            onFormChange(event)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Yes/No" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wheelDiameter">Rim Diameter</Label>
                    <Input
                        id="wheelDiameter"
                        name="wheelDiameter"
                        type="number"
                        min="14"
                        max="22"
                        value={formState.wheelDiameter}
                        onChange={onFormChange}
                        placeholder="e.g., 17"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tyreWidth">Tyre Width</Label>
                    <Input
                        id="tyreWidth"
                        name="tyreWidth"
                        type="number"
                        min="100"
                        max="300"
                        value={formState.tyreWidth}
                        onChange={onFormChange}
                        placeholder="e.g., 195"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <Input
                        id="aspectRatio"
                        name="aspectRatio"
                        type="number"
                        min="20"
                        max="60"
                        value={formState.aspectRatio}
                        onChange={onFormChange}
                        placeholder="e.g., 45"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unitQty">Number of Items</Label>
                    <Input
                        id="unitQty"
                        name="unitQty"
                        type="number"
                        min="1"
                        max="6"
                        value={formState.unitQty}
                        onChange={onFormChange}
                        placeholder="e.g., 4"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>
            </div>
        </div>
    )
}
