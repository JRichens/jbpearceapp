'use client'

import { Car } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type TitleParameter = {
    key: keyof Car | 'genuine'
    label: string
    value?: string
    isCustom?: boolean
}

export const formatNomCC = (value: any): string => {
    if (typeof value !== 'number' && typeof value !== 'string') return ''
    const stringValue = value.toString()
    return stringValue.includes('.') ? stringValue : `${stringValue}.0`
}

const TITLE_PARAMETERS: TitleParameter[] = [
    {
        key: 'genuine',
        label: 'Genuine',
        value: '✅ GENUINE',
        isCustom: true,
    },
    { key: 'dvlaMake', label: 'Make' },
    { key: 'dvlaModel', label: 'Model' },
    { key: 'modelSeries', label: 'Model Series' },
    { key: 'modelVariant', label: 'Model Variant' },
    { key: 'dvlaYearOfManufacture', label: 'Year' },
    { key: 'colourCurrent', label: 'Color' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'nomCC', label: 'Engine Capacity' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'driveType', label: 'Drive Type' },
]

interface TitleParametersProps {
    vehicle: Car | null
    selectedParams: Set<string>
    onParamChange: (param: string) => void
    className?: string
}

export function TitleParameters({
    vehicle,
    selectedParams,
    onParamChange,
    className = '',
}: TitleParametersProps) {
    if (!vehicle) return null

    const formatValue = (param: TitleParameter, vehicleValue: any) => {
        if (param.isCustom) return param.value
        if (param.key === 'nomCC') {
            return formatNomCC(vehicleValue)
        }
        return vehicleValue?.toString() || ''
    }

    return (
        <div className={className}>
            <ScrollArea className="h-[400px] w-full rounded-md">
                <div className="grid grid-cols-2 gap-2 p-1">
                    {TITLE_PARAMETERS.map((param) => {
                        const value = param.isCustom
                            ? param.value
                            : vehicle[param.key as keyof Car]
                        const isSelected = selectedParams.has(param.key)

                        if (!value && !param.isCustom) return null // Don't show button if no value exists (except for custom parameters)

                        return (
                            <button
                                key={param.key}
                                onClick={() => onParamChange(param.key)}
                                className={cn(
                                    'px-3 py-2 text-sm rounded-lg transition-all duration-200 w-full text-left',
                                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                                    'border border-gray-200 dark:border-gray-700',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                        : 'bg-white dark:bg-gray-900'
                                )}
                            >
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    {param.label}
                                </span>
                                <span
                                    className={cn(
                                        'block font-medium',
                                        isSelected
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-gray-100'
                                    )}
                                >
                                    {formatValue(param, value)}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

export { TITLE_PARAMETERS }
export type { TitleParameter }
