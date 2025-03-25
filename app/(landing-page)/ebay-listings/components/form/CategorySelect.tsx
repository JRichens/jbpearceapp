'use client'

import { Category } from '../../types/listingTypes'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronDown, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WHEEL_TYRE_CATEGORIES } from '../../constants/categories'

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
    const [searchTerm, setSearchTerm] = useState('')

    // Reset search term when dialog closes
    useEffect(() => {
        if (!isCategoryOpen) {
            setSearchTerm('')
        }
    }, [isCategoryOpen])

    // If we're in wheels/tyres mode (using default vehicle), only show wheel/tyre categories
    const allCategories =
        vehicle?.uniqueId === 'wheels-tyres'
            ? WHEEL_TYRE_CATEGORIES
            : [
                  ...categories,
                  ...WHEEL_TYRE_CATEGORIES.filter(
                      (wheelTyreCat) =>
                          !categories.some((cat) => cat.id === wheelTyreCat.id)
                  ),
              ]

    // Filter categories based on search term
    const filteredCategories = searchTerm
        ? allCategories.filter(
              (category) =>
                  category.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  category.fullPath
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
          )
        : allCategories

    const getCategoryPlaceholder = () => {
        if (isCategoriesLoading) {
            return (
                <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading categories...</span>
                </div>
            )
        }
        if (vehicle?.uniqueId === 'wheels-tyres') {
            return selectedCategory
                ? selectedCategory.finalName
                : 'Select Wheels/Tyres Category'
        }
        if (!vehicle) return 'Enter vehicle registration first'
        if (!partDescription) return 'Enter part description first'
        return selectedCategory
            ? selectedCategory.finalName
            : 'Select a category'
    }

    const renderCategoryOption = (category: Category) => {
        // For the main display, use the category name
        const displayName = category.name

        // For the full path, use the fullPath property
        const fullPath = category.fullPath

        // Check if there's a percentage match (for API-suggested categories)
        const percentageMatch = category.finalName.match(/\((\d+)%\)/)
        const percentage = percentageMatch ? percentageMatch[1] : null

        return (
            <div className="flex flex-col gap-1 py-3 px-3">
                <div className="font-medium whitespace-normal break-words leading-snug flex justify-between items-center text-xl">
                    <span>
                        {displayName}
                        {percentage ? ` (${percentage}%)` : ''}
                    </span>
                </div>
                {/* Show the full path in a smaller font and different color */}
                {fullPath && fullPath !== displayName && (
                    <div className="text-sm text-gray-500 whitespace-normal break-words">
                        {fullPath}
                    </div>
                )}
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
                    disabled={isCategoriesLoading}
                >
                    <span className="truncate">{getCategoryPlaceholder()}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                    <DialogContent className="p-0 w-[90%] max-w-[600px] [&>button]:hidden">
                        {/* Search box - only show for fallback categories (more than 3) */}
                        {allCategories.length > 3 && (
                            <div className="sticky top-0 z-10 p-3 bg-white border-b border-gray-200 shadow-sm">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="sr-only">
                                                Clear search
                                            </span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {filteredCategories.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        No categories found matching &quot;
                                        {searchTerm}&quot;
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="py-1 max-h-[400px] overflow-y-auto">
                            {filteredCategories.map((category) => (
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
                    {allCategories.map((category) => (
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
