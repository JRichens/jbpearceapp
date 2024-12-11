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
    splitWords?: boolean
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
    { key: 'dvlaModel', label: 'Model', splitWords: true },
    { key: 'modelSeries', label: 'Model Series', splitWords: true },
    { key: 'modelVariant', label: 'Model Variant', splitWords: true },
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
    { key: 'nomCC', label: 'Engine Capacity' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'driveType', label: 'Drive Type' },
    {
        key: 'passenger',
        label: 'Passenger',
        value: 'N/S PASSENGER LEFT',
        isCustom: true,
    },
    {
        key: 'driver',
        label: 'Driver',
        value: 'O/S DRIVER RIGHT',
        isCustom: true,
    },
    { key: 'colourCurrent', label: 'Colour' },
]

interface TitleParametersProps {
    vehicle: Car | null
    selectedParams: Set<string>
    onParamChange: (param: string) => void
    className?: string
    productionYearInfo?: ProductionYearInfo | null
}

interface WordOccurrence {
    word: string
    paramKey: string
    isFirstVisibleOccurrence: boolean
    label: string
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
                    return `${productionYearInfo.from}-${productionYearInfo.to}`
                }
                if (
                    param.key === 'productionYearsFL' &&
                    productionYearInfo.facelift
                ) {
                    return `${productionYearInfo.from}-${productionYearInfo.facelift}`
                }
            }
            return null
        }
        const value = vehicle[param.key as keyof Car]
        if (param.key === 'nomCC' && value) {
            return formatNomCC(value)
        }
        // Convert all non-custom parameter values to uppercase
        return value?.toString().toUpperCase() || ''
    }

    // Function to get word occurrences with visibility flag
    const getWordOccurrences = () => {
        const wordMap = new Map<string, WordOccurrence[]>()
        const splitWordParams = TITLE_PARAMETERS.filter(
            (param) => param.splitWords
        )

        // First, collect all occurrences
        splitWordParams.forEach((param) => {
            const value = formatValue(param)
            if (!value) return

            const words = value.split(' ')
            words.forEach((word) => {
                const upperWord = word.toUpperCase()
                if (!wordMap.has(upperWord)) {
                    wordMap.set(upperWord, [])
                }
                wordMap.get(upperWord)!.push({
                    word: upperWord, // Ensure word is uppercase
                    paramKey: param.key,
                    isFirstVisibleOccurrence: false,
                    label: param.label,
                })
            })
        })

        // Mark first occurrences
        wordMap.forEach((occurrences) => {
            if (occurrences.length > 0) {
                occurrences[0].isFirstVisibleOccurrence = true
            }
        })

        return wordMap
    }

    const renderSplitWordParameters = () => {
        const wordMap = getWordOccurrences()
        const allVisibleWords: WordOccurrence[] = []

        // Collect all visible words with their context
        TITLE_PARAMETERS.filter((param) => param.splitWords).forEach(
            (param) => {
                const value = formatValue(param)
                if (!value) return

                const words = value.split(' ')
                words.forEach((word) => {
                    const upperWord = word.toUpperCase()
                    const occurrences = wordMap.get(upperWord)
                    if (!occurrences) return

                    const thisOccurrence = occurrences.find(
                        (o) => o.paramKey === param.key
                    )
                    if (thisOccurrence?.isFirstVisibleOccurrence) {
                        allVisibleWords.push(thisOccurrence)
                    }
                })
            }
        )

        if (allVisibleWords.length === 0) return null

        return (
            <div className="w-full space-y-2">
                <div className="flex flex-wrap gap-2">
                    {allVisibleWords.map((occurrence) => {
                        const wordKey = `${occurrence.paramKey}_${occurrence.word}`
                        const isSelected = selectedParams.has(wordKey)
                        return (
                            <button
                                key={wordKey}
                                onClick={() => onParamChange(wordKey)}
                                className={cn(
                                    'px-3 py-2 text-sm rounded-lg transition-all duration-200',
                                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                                    'border border-gray-200 dark:border-gray-700',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                                    'flex-grow basis-auto shrink-0',
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                        : 'bg-white dark:bg-gray-900'
                                )}
                            >
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    {occurrence.label}
                                </span>
                                <span
                                    className={cn(
                                        'block font-medium',
                                        isSelected
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-gray-100'
                                    )}
                                >
                                    {occurrence.word}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderParameter = (param: TitleParameter) => {
        if (param.splitWords) return null // Handle split word parameters separately

        const value = formatValue(param)
        const isSelected = selectedParams.has(param.key)

        // Don't show production year buttons if we have no info
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
                    'px-3 py-2 text-sm rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'border border-gray-200 dark:border-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    'flex-grow basis-auto shrink-0',
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
    }

    return (
        <div className={className}>
            <Label className="text-sm font-medium mb-2 block">
                Title Parameters
            </Label>
            <ScrollArea className="h-[250px] w-full rounded-md border border-gray-200">
                <div className="flex flex-wrap gap-2 p-2">
                    {renderSplitWordParameters()}
                    {TITLE_PARAMETERS.map(renderParameter)}
                </div>
            </ScrollArea>
        </div>
    )
}

export { TITLE_PARAMETERS }
export type { TitleParameter }
