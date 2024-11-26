'use client'

import { useEffect, useState } from 'react'
import { EbayListing } from '@/lib/ebay/types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import Image from 'next/image'

export default function MyListings() {
    const [listings, setListings] = useState<EbayListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const columns = [
        {
            accessorKey: 'image',
            header: 'Image',
            size: 120,
            Cell: ({ row }) =>
                row.original.imageUrls?.[0] && (
                    <div className="w-20 h-20">
                        <Image
                            src={row.original.imageUrls[0]}
                            alt={row.original.title}
                            width={80}
                            height={80}
                            className="object-contain"
                            loading="lazy"
                        />
                    </div>
                ),
        },
        {
            accessorKey: 'title',
            header: 'Title',
            size: 250,
        },
        {
            accessorKey: 'price',
            header: 'Price',
            size: 100,
            Cell: ({ row }) => {
                const value = row.original.price.value
                return `£${value.toString()}`
            },
        },
        {
            accessorKey: 'shippingCost',
            header: 'Shipping',
            size: 100,
            Cell: ({ row }) => {
                if (!row.original.shippingCost) return 'N/A'
                const value = row.original.shippingCost.value
                return value === 0 ? 'FREE' : `£${value.toString()}`
            },
        },
        {
            accessorKey: 'watchCount',
            header: 'Watchers',
            size: 100,
            Cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{row.original.watchCount}</span>
                </div>
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            size: 100,
            Cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        window.open(row.original.listingUrl, '_blank')
                    }
                >
                    View
                </Button>
            ),
        },
    ] as MRT_ColumnDef<EbayListing>[]

    useEffect(() => {
        fetchListings()
    }, [])

    const fetchListings = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/ebay-listings')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.details || data.error || 'Failed to fetch listings'
                )
            }

            setListings(data)
        } catch (err) {
            console.error('Error fetching listings:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">Error: {error}</p>
                <Button
                    onClick={fetchListings}
                    variant="outline"
                    className="mt-2"
                >
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={fetchListings} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <MaterialReactTable
                columns={columns}
                data={listings}
                enableColumnActions={false}
                enableColumnFilters={false}
                enablePagination={true}
                enableSorting={true}
                enableBottomToolbar={true}
                enableTopToolbar={true}
                initialState={{
                    pagination: { pageIndex: 0, pageSize: 25 },
                    sorting: [{ id: 'watchCount', desc: true }],
                }}
                muiTableBodyRowProps={{ hover: true }}
                muiTableContainerProps={{
                    sx: {
                        maxHeight: '65vh',
                    },
                }}
                muiTableHeadProps={{
                    sx: {
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 1,
                    },
                }}
                renderEmptyRowsFallback={() => (
                    <div className="text-center py-8">
                        No active eBay listings found
                    </div>
                )}
            />
        </div>
    )
}
