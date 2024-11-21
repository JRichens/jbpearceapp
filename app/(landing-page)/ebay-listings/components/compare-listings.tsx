'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

interface ComparisonResult {
    summary: {
        totalMissingFields: number
        totalDifferences: number
    }
    missingFields: Array<{
        field: string
        manualValue: any
    }>
    differences: Array<{
        field: string
        api: string
        manual: string
    }>
    recommendations: string[]
    details: {
        apiListing: Record<string, any>
        manualListing: Record<string, any>
    }
}

export default function CompareListings() {
    const [apiListingId, setApiListingId] = useState('')
    const [manualListingId, setManualListingId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [comparison, setComparison] = useState<ComparisonResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleCompare(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setComparison(null)

        try {
            const response = await fetch(
                `/api/ebay-listings/compare?apiListingId=${apiListingId}&manualListingId=${manualListingId}`
            )
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to compare listings')
            }

            setComparison(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">
                    Compare eBay Listings
                </h1>

                <form onSubmit={handleCompare} className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiListingId">API Listing ID</Label>
                            <Input
                                id="apiListingId"
                                value={apiListingId}
                                onChange={(e) =>
                                    setApiListingId(e.target.value)
                                }
                                placeholder="e.g., 356259602314"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="manualListingId">
                                Manual Listing ID
                            </Label>
                            <Input
                                id="manualListingId"
                                value={manualListingId}
                                onChange={(e) =>
                                    setManualListingId(e.target.value)
                                }
                                placeholder="e.g., 356147995161"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Comparing...
                            </>
                        ) : (
                            'Compare Listings'
                        )}
                    </Button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {comparison && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h2 className="font-semibold text-blue-800 mb-2">
                                Summary
                            </h2>
                            <ul className="text-blue-700 space-y-1">
                                <li>
                                    Missing Fields:{' '}
                                    {comparison.summary.totalMissingFields}
                                </li>
                                <li>
                                    Differences Found:{' '}
                                    {comparison.summary.totalDifferences}
                                </li>
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <h2 className="font-semibold text-green-800 mb-2">
                                Recommendations
                            </h2>
                            <ul className="text-green-700 space-y-1">
                                {comparison.recommendations.map(
                                    (rec, index) => (
                                        <li key={index}>• {rec}</li>
                                    )
                                )}
                            </ul>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {/* Missing Fields */}
                            <AccordionItem value="missing">
                                <AccordionTrigger className="text-amber-800">
                                    Missing Fields (
                                    {comparison.missingFields.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        {comparison.missingFields.map(
                                            (field, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-amber-50 border border-amber-200 rounded-md p-3"
                                                >
                                                    <p className="font-medium text-amber-900">
                                                        {field.field}
                                                    </p>
                                                    <p className="text-sm text-amber-700">
                                                        Manual Value:{' '}
                                                        {typeof field.manualValue ===
                                                        'object'
                                                            ? JSON.stringify(
                                                                  field.manualValue
                                                              )
                                                            : String(
                                                                  field.manualValue
                                                              )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Value Differences */}
                            <AccordionItem value="differences">
                                <AccordionTrigger className="text-purple-800">
                                    Value Differences (
                                    {comparison.differences.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        {comparison.differences.map(
                                            (diff, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-purple-50 border border-purple-200 rounded-md p-3"
                                                >
                                                    <p className="font-medium text-purple-900">
                                                        {diff.field}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                                                        <div>
                                                            <span className="text-purple-700">
                                                                API:
                                                            </span>{' '}
                                                            {diff.api}
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700">
                                                                Manual:
                                                            </span>{' '}
                                                            {diff.manual}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Full Details */}
                            <AccordionItem value="details">
                                <AccordionTrigger className="text-gray-800">
                                    Full Listing Details
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                API Listing
                                            </h3>
                                            <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
                                                {JSON.stringify(
                                                    comparison.details
                                                        .apiListing,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                Manual Listing
                                            </h3>
                                            <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
                                                {JSON.stringify(
                                                    comparison.details
                                                        .manualListing,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </Card>
        </div>
    )
}
