'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormState } from '../../types/listingTypes'

interface WheelTyreInfoProps {
    formState: FormState
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => void
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
}

export function WheelTyreInfo({
    formState,
    onFormChange,
    setFormState,
}: WheelTyreInfoProps) {
    const handleShowCarInfoChange = (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            showCarInfo: checked,
            isVerified: false,
            verificationResult: null,
        }))
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Wheel & Tyre Information
                </h3>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="show-car-info"
                        checked={formState.showCarInfo}
                        onCheckedChange={handleShowCarInfoChange}
                    />
                    <Label htmlFor="show-car-info">Show Car Info</Label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="wheelDiameter">Wheel Diameter</Label>
                    <Input
                        id="wheelDiameter"
                        name="wheelDiameter"
                        type="number"
                        min="14"
                        max="22"
                        value={formState.wheelDiameter || ''}
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
                        max="400"
                        value={formState.tyreWidth || ''}
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
                        max="100"
                        value={formState.aspectRatio || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 45"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="numberOfStuds">Number of Studs</Label>
                    <Input
                        id="numberOfStuds"
                        name="numberOfStuds"
                        type="number"
                        min="2"
                        max="8"
                        value={formState.numberOfStuds || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 5"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="centreBore">Centre Bore (mm)</Label>
                    <Input
                        id="centreBore"
                        name="centreBore"
                        type="text"
                        value={formState.centreBore || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 66.5"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="packageQuantity">Number of Items</Label>
                    <Input
                        id="packageQuantity"
                        name="packageQuantity"
                        type="number"
                        min="1"
                        max="8"
                        value={formState.packageQuantity || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 4"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Required</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wheelMaterial">Wheel Material</Label>
                    <Select
                        name="wheelMaterial"
                        value={formState.wheelMaterial || ''}
                        onValueChange={(value) => {
                            const event = {
                                target: {
                                    name: 'wheelMaterial',
                                    value,
                                },
                            } as React.ChangeEvent<HTMLSelectElement>
                            onFormChange(event)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Steel">Steel</SelectItem>
                            <SelectItem value="Aluminium">Aluminium</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wheelBrand">Wheel Brand</Label>
                    <Input
                        id="wheelBrand"
                        name="wheelBrand"
                        type="text"
                        value={formState.wheelBrand || ''}
                        onChange={onFormChange}
                        placeholder="e.g., BMW"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pcd">PCD (Pitch Circle Diameter)</Label>
                    <Input
                        id="pcd"
                        name="pcd"
                        type="text"
                        value={formState.pcd || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 5x114.3"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>
            </div>
        </div>
    )
}
