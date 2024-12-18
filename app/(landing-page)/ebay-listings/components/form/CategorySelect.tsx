'use client'

import { Category } from '../../types/listingTypes'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)

    const getCategoryPlaceholder = () => {
        if (isCategoriesLoading) return 'Loading categories...'
        if (categories.length > 0)
            return selectedCategory
                ? selectedCategory.finalName
                : 'Select a category'
        if (!vehicle) return 'Enter vehicle registration first'
        if (!partDescription) return 'Enter part description first'
        return 'No matching categories found'
    }

    const renderCategoryOption = (category: Category) => {
        const pathParts = category.fullPath.split(' > ')
        const finalPart = pathParts[pathParts.length - 1]
        const percentageMatch = category.finalName.match(/\((\d+)%\)/)
        const percentage = percentageMatch ? percentageMatch[1] : null

        return (
            <div className="flex flex-col gap-2 py-3 px-3">
                <div className="font-medium whitespace-normal break-words leading-snug flex justify-between items-center text-xl">
                    <span>
                        {finalPart}
                        {percentage ? ` (${percentage}%)` : ''}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={className}>
            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryOpen}
                    className="w-full justify-between text-xl bg-white h-auto min-h-[40px] py-2"
                    onClick={() => setIsCategoryOpen(true)}
                    disabled={isCategoriesLoading || categories.length === 0}
                >
                    <span className="truncate">{getCategoryPlaceholder()}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                    <DialogContent className="p-0 w-[90%] max-w-[600px] [&>button]:hidden">
                        <div className="py-1 max-h-[400px] overflow-y-auto">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={cn(
                                        'w-full text-left hover:bg-gray-200',
                                        selectedCategory?.id === category.id &&
                                            'bg-gray-100'
                                    )}
                                    onClick={() => {
                                        onCategoryChange(category.id)
                                        setIsCategoryOpen(false)
                                    }}
                                >
                                    {renderCategoryOption(category)}
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <select
                    name="category"
                    required
                    value={selectedCategory?.id || ''}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="sr-only"
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.finalName}
                        </option>
                    ))}
                </select>
            </div>
            {categoriesError && (
                <p className="text-sm text-red-500">{categoriesError}</p>
            )}
        </div>
    )
}
