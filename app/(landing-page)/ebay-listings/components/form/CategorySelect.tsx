'use client'

import { Category } from '../types'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface CategorySelectProps {
    categories: Category[]
    selectedCategory: Category | null
    onCategoryChange: (categoryId: string) => void
    isCategoriesLoading: boolean
    categoriesError: string | null
    vehicle: any
    partDescription: string
    className?: string
}

export function CategorySelect({
    categories,
    selectedCategory,
    onCategoryChange,
    isCategoriesLoading,
    categoriesError,
    vehicle,
    partDescription,
    className,
}: CategorySelectProps) {
    const getCategoryPlaceholder = () => {
        if (isCategoriesLoading) return 'Loading categories...'
        if (!vehicle) return 'Enter vehicle registration first'
        if (!partDescription) return 'Enter part description first'
        if (categories.length === 0) return 'No matching categories found'
        if (selectedCategory) return selectedCategory.finalName
        return 'Select a category'
    }

    const renderCategoryOption = (category: Category) => {
        const pathParts = category.fullPath.split(' > ')
        const finalPart = pathParts[pathParts.length - 1]
        const percentageMatch = category.finalName.match(/\((\d+)%\)/)
        const percentage = percentageMatch ? percentageMatch[1] : null

        return (
            <div className="flex flex-col gap-2 py-3 px-3">
                <div className="font-medium whitespace-normal break-words leading-snug flex justify-between items-center text-xl">
                    <span>{finalPart}</span>
                    {percentage && (
                        <span className="text-sm text-muted-foreground ml-2">
                            ({percentage}%)
                        </span>
                    )}
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-snug">
                    {pathParts.slice(0, -1).join(' > ')}
                </div>
            </div>
        )
    }

    return (
        <div className={className}>
            <Select
                name="category"
                required
                value={selectedCategory?.id}
                onValueChange={onCategoryChange}
            >
                <SelectTrigger className="h-auto min-h-[40px] py-2 text-xl">
                    <SelectValue
                        placeholder={getCategoryPlaceholder()}
                        className="whitespace-normal break-words text-xl"
                    />
                </SelectTrigger>
                <SelectContent
                    className="max-h-[300px] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-none"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={true}
                >
                    <div className="overflow-y-auto max-h-[300px]">
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={category.id}
                                className="py-0 whitespace-normal hover:bg-accent focus:bg-accent"
                            >
                                {renderCategoryOption(category)}
                            </SelectItem>
                        ))}
                    </div>
                </SelectContent>
            </Select>
            {categoriesError && (
                <p className="text-sm text-red-500">{categoriesError}</p>
            )}
            {isCategoriesLoading && (
                <p className="text-sm text-muted-foreground">
                    Loading categories...
                </p>
            )}
        </div>
    )
}
