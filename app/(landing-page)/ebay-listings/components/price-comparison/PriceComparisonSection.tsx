import { Car } from '@prisma/client'
import Image from 'next/image'
import { Loader2, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePriceComparisons } from '../../hooks/usePriceComparisons'
import { Category, FormState } from '../../types/listingTypes'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMemo, useState } from 'react'

interface StatusBadgeProps {
    status: 'active' | 'sold'
    soldDate?: string
}

const StatusBadge = ({ status, soldDate }: StatusBadgeProps) => {
    if (status === 'active') {
        return (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                For Sale
            </Badge>
        )
    }
    return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {soldDate ? `Sold ${soldDate}` : 'Sold'}
        </Badge>
    )
}

interface PriceSummaryProps {
    items: Array<{
        price: number
        status: 'active' | 'sold'
        url: string
    }>
    removedItems: Set<string>
}

const PriceSummary = ({ items, removedItems }: PriceSummaryProps) => {
    const filteredItems = useMemo(
        () => items.filter((item) => !removedItems.has(item.url)),
        [items, removedItems]
    )

    const activeItems = useMemo(
        () => filteredItems.filter((item) => item.status === 'active'),
        [filteredItems]
    )

    const soldItems = useMemo(
        () => filteredItems.filter((item) => item.status === 'sold'),
        [filteredItems]
    )

    const topActiveItems = useMemo(
        () => [...activeItems].sort((a, b) => a.price - b.price).slice(0, 5),
        [activeItems]
    )

    const topSoldItems = useMemo(
        () => [...soldItems].sort((a, b) => a.price - b.price).slice(0, 5),
        [soldItems]
    )

    const avgTopActive = useMemo(
        () =>
            topActiveItems.length > 0
                ? topActiveItems.reduce((sum, item) => sum + item.price, 0) /
                  topActiveItems.length
                : 0,
        [topActiveItems]
    )

    const avgTopSold = useMemo(
        () =>
            topSoldItems.length > 0
                ? topSoldItems.reduce((sum, item) => sum + item.price, 0) /
                  topSoldItems.length
                : 0,
        [topSoldItems]
    )

    const overallAverage = useMemo(
        () =>
            (avgTopActive + avgTopSold) / (avgTopActive && avgTopSold ? 2 : 1),
        [avgTopActive, avgTopSold]
    )

    return (
        <Card className="p-4 mb-6">
            <div className="flex flex-row gap-5 justify-around">
                <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">
                        Listing Summary
                    </h3>
                    <div className="text-sm space-y-1">
                        <p>
                            Total Listings:{' '}
                            <span className="font-medium">
                                {filteredItems.length}
                            </span>
                        </p>
                        <p>
                            Active Listings:{' '}
                            <span className="font-medium text-green-600">
                                {activeItems.length}
                            </span>
                        </p>
                        <p>
                            Sold Listings:{' '}
                            <span className="font-medium text-purple-600">
                                {soldItems.length}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">
                        Price Analysis
                    </h3>
                    <div className="text-sm space-y-1">
                        {avgTopActive > 0 && (
                            <p>
                                Avg Top 5 For Sale:{' '}
                                <span className="font-medium text-green-600">
                                    £{avgTopActive.toFixed(2)}
                                </span>
                            </p>
                        )}
                        {avgTopSold > 0 && (
                            <p>
                                Avg Top 5 Sold:{' '}
                                <span className="font-medium text-purple-600">
                                    £{avgTopSold.toFixed(2)}
                                </span>
                            </p>
                        )}
                        {overallAverage > 0 && (
                            <p>
                                Overall Average:{' '}
                                <span className="font-medium text-blue-600">
                                    £{overallAverage.toFixed(2)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

interface PriceComparisonSectionProps {
    vehicle: Car | null
    partDescription: string
    selectedCategory: Category | null
    formState: FormState
}

export function PriceComparisonSection({
    vehicle,
    partDescription,
    selectedCategory,
    formState,
}: PriceComparisonSectionProps) {
    // Initialize search term with make and model if available
    const getInitialSearchTerm = () => {
        if (formState.searchByPartNumber) return formState.activePartNumber

        const parts = []
        if (vehicle?.dvlaMake) parts.push(vehicle.dvlaMake)
        if (vehicle?.dvlaModel) parts.push(vehicle.dvlaModel)
        parts.push(partDescription)
        return parts.join(' ')
    }

    const [editableSearchTerm, setEditableSearchTerm] = useState(
        getInitialSearchTerm()
    )
    const [activeSearchTerm, setActiveSearchTerm] = useState(
        getInitialSearchTerm()
    )
    const [isManualSearch, setIsManualSearch] = useState(false)

    // Use activeSearchTerm instead of editableSearchTerm for searches
    const { priceComparisons, searchTerms, isLoadingPrices } =
        usePriceComparisons(
            isManualSearch ? null : vehicle,
            activeSearchTerm,
            selectedCategory
        )

    const [removedItems, setRemovedItems] = useState<Set<string>>(new Set())
    const [showActive, setShowActive] = useState(true)
    const [showSold, setShowSold] = useState(true)

    const handleSearch = () => {
        setIsManualSearch(true)
        setActiveSearchTerm(editableSearchTerm) // Only update the active search term when search is triggered
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const filteredItems = useMemo(
        () =>
            priceComparisons
                .filter((item) => !removedItems.has(item.url))
                .filter((item) => {
                    if (item.status === 'active') return showActive
                    if (item.status === 'sold') return showSold
                    return false
                }),
        [priceComparisons, removedItems, showActive, showSold]
    )

    const { visibleItems, hasMore, loadMoreRef } =
        useInfiniteScroll(filteredItems)

    const handleRemoveItem = (url: string) => {
        setRemovedItems((prev) => {
            const newSet = new Set(prev)
            newSet.add(url)
            return newSet
        })
    }

    const activeCount = useMemo(
        () =>
            priceComparisons.filter((item) => item.status === 'active').length,
        [priceComparisons]
    )

    const soldCount = useMemo(
        () => priceComparisons.filter((item) => item.status === 'sold').length,
        [priceComparisons]
    )

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Compare Prices</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowActive(!showActive)}
                            variant={showActive ? 'default' : 'outline'}
                            className={
                                showActive
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : ''
                            }
                            size="sm"
                        >
                            For Sale ({activeCount})
                        </Button>
                        <Button
                            onClick={() => setShowSold(!showSold)}
                            variant={showSold ? 'default' : 'outline'}
                            className={
                                showSold
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : ''
                            }
                            size="sm"
                        >
                            Sold ({soldCount})
                        </Button>
                    </div>
                </div>
            </div>

            {activeSearchTerm && (
                <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3">
                        Search Details:
                    </h3>
                    <div className="flex gap-2 mb-3">
                        <Input
                            value={editableSearchTerm}
                            onChange={(e) =>
                                setEditableSearchTerm(e.target.value)
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="Enter search term"
                            className="text-sm"
                        />
                        <Button
                            onClick={handleSearch}
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    {selectedCategory ? (
                        <p className="text-sm text-gray-600">
                            Searching in Category: {selectedCategory.finalName}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600">
                            Searching in All Categories
                        </p>
                    )}
                    {!isManualSearch && (
                        <>
                            {formState.searchByPartNumber && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Initial Search by Part Number:{' '}
                                    {formState.activePartNumber}
                                </p>
                            )}
                            {searchTerms &&
                                searchTerms.modelSeries !==
                                    searchTerms.year && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">
                                                Model Search:
                                            </span>{' '}
                                            {searchTerms.modelSeries}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">
                                                Year Search:
                                            </span>{' '}
                                            {searchTerms.year}
                                        </p>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            )}

            {isLoadingPrices && (
                <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                    <div className="flex items-center">
                        <Loader2 className="mr-2 animate-spin" />
                        <div className="text-sm font-medium text-gray-500">
                            Loading price comparisons...
                        </div>
                    </div>
                </div>
            )}

            {!isLoadingPrices && visibleItems.length > 0 && (
                <>
                    <PriceSummary
                        items={priceComparisons}
                        removedItems={removedItems}
                    />

                    <div className="space-y-4">
                        {visibleItems.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white shadow-sm rounded-md border border-gray-200 hover:shadow-md transition-shadow flex"
                            >
                                <div className="flex flex-col w-32 flex-shrink-0">
                                    <div className="relative w-32 h-32">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            sizes="128px"
                                            className="object-cover rounded-l-md"
                                            priority={index < 4}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {item.title}
                                            </a>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveItem(item.url)
                                                }
                                                className="h-6 w-6 rounded-full hover:bg-red-100"
                                            >
                                                <X className="h-4 w-4 text-red-600" />
                                            </Button>
                                            <div className="text-lg font-bold text-green-600">
                                                £{item.price.toFixed(2)}
                                            </div>

                                            <StatusBadge
                                                status={item.status}
                                                soldDate={
                                                    item.soldDate
                                                        ? item.soldDate.slice(
                                                              0,
                                                              -5
                                                          )
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                className="w-full h-10 flex items-center justify-center"
                            >
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                    </div>
                </>
            )}

            {!isLoadingPrices && priceComparisons.length === 0 && (
                <Alert>
                    <AlertDescription>
                        No similar listings found. Try adjusting your search
                        criteria.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
