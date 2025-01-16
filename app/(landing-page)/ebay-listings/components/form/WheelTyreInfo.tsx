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
import { toast } from 'sonner'

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
        if (checked && !formState.vehicle) {
            toast.error('Please enter a vehicle registration first')
            return
        }

        setFormState((prev) => ({
            ...prev,
            showCarInfo: checked,
            isVerified: false,
            verificationResult: null,
        }))
    }

    const handleStudsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFormChange(e)
        // Auto-generate PCD when both studDiameter and numberOfStuds are available
        if (e.target.value && formState.studDiameter) {
            const pcdValue = `${e.target.value}x${formState.studDiameter}`
            setFormState((prev) => ({
                ...prev,
                pcd: pcdValue,
            }))
        }
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
                    <Label htmlFor="offset">Offset (ET)</Label>
                    <Input
                        id="offset"
                        name="offset"
                        type="number"
                        min="-80"
                        max="80"
                        value={formState.offset || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 35"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wheelWidth">Wheel Width</Label>
                    <Input
                        id="wheelWidth"
                        name="wheelWidth"
                        type="number"
                        min="5"
                        max="12"
                        value={formState.wheelWidth || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 8"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
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
                        onChange={handleStudsChange}
                        placeholder="e.g., 5"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="studDiameter">Stud Diameter</Label>
                    <Input
                        id="studDiameter"
                        name="studDiameter"
                        type="number"
                        min="80"
                        max="200"
                        value={formState.studDiameter || ''}
                        onChange={(e) => {
                            onFormChange(e)
                            // Auto-generate PCD when both studDiameter and numberOfStuds are available
                            if (e.target.value && formState.numberOfStuds) {
                                const pcdValue = `${formState.numberOfStuds}x${e.target.value}`
                                setFormState((prev) => ({
                                    ...prev,
                                    pcd: pcdValue,
                                }))
                            }
                        }}
                        placeholder="e.g., 130"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="centreBore">Centre Bore (mm)</Label>
                    <Input
                        id="centreBore"
                        name="centreBore"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formState.centreBore || ''}
                        onChange={onFormChange}
                        placeholder="e.g., 66.5"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="packageQuantity">Package Quantity</Label>
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
                        onChange={(e) => {
                            const newEvent = {
                                ...e,
                                target: {
                                    ...e.target,
                                    value: e.target.value.toUpperCase(),
                                },
                            } as React.ChangeEvent<HTMLInputElement>
                            onFormChange(newEvent)
                        }}
                        placeholder="e.g., BMW"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>

                {/* Hidden PCD field that gets auto-populated */}
                <input type="hidden" name="pcd" value={formState.pcd || ''} />
            </div>
        </div>
    )
}
