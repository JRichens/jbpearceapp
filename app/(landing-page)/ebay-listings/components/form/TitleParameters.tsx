'use client'

import { Car } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ProductionYearInfo } from '../../types/listingTypes'

type TitleParameter = {
    key:
        | keyof Car
        | 'genuine'
        | 'passenger'
        | 'driver'
        | 'productionYears'
        | 'productionYearsFL'
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
        key: 'passenger',
        label: 'Passenger',
        value: 'N/S Passenger Left',
        isCustom: true,
    },
    {
        key: 'driver',
        label: 'Driver',
        value: 'O/S Driver Right',
        isCustom: true,
    },
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
    {
        key: 'productionYears',
        label: 'Production Years',
        isCustom: true,
    },
    {
        key: 'productionYearsFL',
        label: 'Production Years FL',
        isCustom: true,
    },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'nomCC', label: 'Engine Capacity' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'driveType', label: 'Drive Type' },
    { key: 'colourCurrent', label: 'Colour' },
]

interface TitleParametersProps {
    vehicle: Car | null
    selectedParams: Set<string>
    onParamChange: (param: string) => void
    className?: string
    productionYearInfo?: ProductionYearInfo | null
}

export function TitleParameters({
    vehicle,
    selectedParams,
    onParamChange,
    className = '',
    productionYearInfo,
}: TitleParametersProps) {
    if (!vehicle) return null

    const formatValue = (param: TitleParameter) => {
        if (param.isCustom) {
            if (
                param.key === 'genuine' ||
                param.key === 'passenger' ||
                param.key === 'driver'
            )
                return param.value
            if (productionYearInfo) {
                if (param.key === 'productionYears') {
                    return `${productionYearInfo.from} to ${productionYearInfo.to}`
                }
                if (
                    param.key === 'productionYearsFL' &&
                    productionYearInfo.facelift
                ) {
                    return `${productionYearInfo.from} to ${productionYearInfo.facelift}`
                }
            }
            return null
        }
        const value = vehicle[param.key as keyof Car]
        if (param.key === 'nomCC' && value) {
            return formatNomCC(value)
        }
        return value?.toString() || ''
    }

    return (
        <div className={className}>
            <Label className="text-sm font-medium mb-2 block">
                Title Parameters
            </Label>
            <ScrollArea className="h-[250px] w-full rounded-md border border-gray-200">
                <div className="grid grid-cols-2 gap-2 p-2">
                    {TITLE_PARAMETERS.map((param) => {
                        const value = formatValue(param)
                        const isSelected = selectedParams.has(param.key)

                        // Only show production year buttons if we have the info
                        if (
                            (param.key === 'productionYears' ||
                                param.key === 'productionYearsFL') &&
                            !productionYearInfo
                        ) {
                            return null
                        }
                        // Don't show FL option if there's no facelift year
                        if (
                            param.key === 'productionYearsFL' &&
                            !productionYearInfo?.facelift
                        ) {
                            return null
                        }
                        // Don't show button if no value exists (except for custom parameters)
                        if (!value && !param.isCustom) return null

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
                                    {value}
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
