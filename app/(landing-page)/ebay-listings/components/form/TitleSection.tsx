'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormSectionProps } from '../../types/form.types'
import { TitleParameters, TITLE_PARAMETERS } from './TitleParameters'
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
    const processTitle = (selectedParams: Set<string>, vehicle: Car | null) => {
        if (!vehicle) return ''

        let titleParts: string[] = []

        // Process each parameter
        TITLE_PARAMETERS.forEach((param) => {
            // Handle split word parameters
            if (param.splitWords) {
                const value = vehicle[param.key as keyof Car]?.toString() || ''
                const words = value.split(' ')
                words.forEach((word) => {
                    const wordKey = `${param.key}_${word}`
                    if (selectedParams.has(wordKey)) {
                        titleParts.push(word)
                    }
                })
            }
            // Handle regular parameters
            else if (selectedParams.has(param.key)) {
                if (param.isCustom) {
                    if (param.value) {
                        titleParts.push(param.value)
                    } else if (
                        param.key === 'productionYears' &&
                        productionYearInfo
                    ) {
                        titleParts.push(
                            `${productionYearInfo.from} to ${productionYearInfo.to}`
                        )
                    } else if (
                        param.key === 'productionYearsFL' &&
                        productionYearInfo?.facelift
                    ) {
                        titleParts.push(
                            `${productionYearInfo.from} to ${productionYearInfo.facelift}`
                        )
                    }
                } else {
                    const value = vehicle[param.key as keyof Car]
                    if (value) {
                        if (param.key === 'nomCC') {
                            titleParts.push(
                                value.toString().includes('.')
                                    ? value.toString()
                                    : `${value}.0`
                            )
                        } else {
                            titleParts.push(value.toString())
                        }
                    }
                }
            }
        })

        return titleParts.join(' ')
    }

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
                        const upperCaseValue = e.target.value.toUpperCase()
                        setFormState((prev) => ({
                            ...prev,
                            title: upperCaseValue,
                        }))
                        onFormChange(upperCaseValue)
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
