'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormSectionProps } from '../../types/form.types'
import { TitleParameters } from './TitleParameters'
import { Car } from '@prisma/client'

interface TitleSectionProps extends FormSectionProps {
    vehicle: Car | null
    productionYearInfo: any
    onTitleParamChange: (param: string) => void
}

export function TitleSection({
    formState,
    setFormState,
    onFormChange,
    vehicle,
    productionYearInfo,
    onTitleParamChange,
}: TitleSectionProps) {
    return (
        <div className="space-y-6">
            {vehicle && (
                <TitleParameters
                    vehicle={formState.vehicle}
                    selectedParams={formState.selectedTitleParams}
                    onParamChange={onTitleParamChange}
                    productionYearInfo={productionYearInfo}
                    className="space-y-2"
                />
            )}

            <div className="space-y-2">
                <Label htmlFor="title">
                    {'Title (' + formState.title.length + '/80)'}
                </Label>
                <Textarea
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setFormState((prev) => ({
                            ...prev,
                            title: e.target.value,
                        }))
                        onFormChange(e.target.value)
                    }}
                    placeholder="Enter item title (up to 80 characters)"
                    required
                    maxLength={80}
                    className="no-scrollbar resize-none h-[100px] text-xl"
                />
            </div>
        </div>
    )
}
