'use client'

import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import { getGroupedListings } from '@/actions/ebay/get-grouped-listings'
import { useEffect, useMemo, useState } from 'react'
import { GroupedListing } from './types'
import { Button } from '@/components/ui/button'
import moment from 'moment'

export default function Page() {
    const [data, setData] = useState<GroupedListing[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const listings = await getGroupedListings()
                setData(listings)
            } catch (error) {
                console.error('Error fetching listings:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const columns = useMemo<MRT_ColumnDef<GroupedListing>[]>(
        () => [
            {
                accessorKey: 'carReg',
                header: 'Registration',
            },
            {
                accessorKey: 'dvlaMake',
                header: 'Make',
            },
            {
                accessorKey: 'dvlaModel',
                header: 'Model',
            },
            {
                accessorKey: 'modelSeries',
                header: 'Series',
            },
            {
                accessorKey: 'firstListed',
                header: 'First Listed',
                Cell: ({ row }) =>
                    row.original.firstListed
                        ? moment(row.original.firstListed).format('DD/MM/YYYY')
                        : 'N/A',
            },
            {
                accessorKey: 'totalListed',
                header: 'Total Listed Value',
                Cell: ({ row }) => `£${row.original.totalListed.toFixed(2)}`,
            },
            {
                accessorKey: 'totalSold',
                header: 'Total Sold Value',
                Cell: ({ row }) => `£${row.original.totalSold.toFixed(2)}`,
            },
        ],
        []
    )

    const renderDetailPanel = ({ row }: { row: any }) => {
        const detailColumns = [
            { header: 'Part Description', accessorKey: 'partDescription' },
            {
                header: 'Listed By',
                accessorKey: 'user.name',
                size: 80,
            },
            {
                header: 'Price Listed',
                accessorKey: 'priceListed',
                size: 80,
                Cell: ({ cell }: { cell: any }) =>
                    `£${cell.getValue().toFixed(2)}`,
            },
            {
                header: 'Time Listed',
                accessorKey: 'dateListed',
                Cell: ({ cell }: { cell: any }) =>
                    moment(cell.getValue()).fromNow(),
            },
            {
                header: 'Price Sold',
                accessorKey: 'priceSold',
                Cell: ({ cell }: { cell: any }) =>
                    cell.getValue()
                        ? `£${cell.getValue().toFixed(2)}`
                        : 'Not sold',
            },
            {
                header: 'Date Sold',
                accessorKey: 'dateSold',
                Cell: ({ cell }: { cell: any }) =>
                    cell.getValue()
                        ? moment(cell.getValue()).format('DD/MM/YYYY HH:mm')
                        : 'Not sold',
            },
            {
                header: 'Actions',
                Cell: ({ row }: { row: any }) => (
                    <Button
                        onClick={() =>
                            window.open(row.original.ebayUrl, '_blank')
                        }
                        variant="outline"
                        size="sm"
                    >
                        View on eBay
                    </Button>
                ),
            },
        ]

        return (
            <MaterialReactTable
                columns={detailColumns}
                data={row.original.listings}
                enableTopToolbar={false}
                enableBottomToolbar={false}
                enableColumnActions={false}
                enableColumnFilters={false}
                enablePagination={false}
                enableSorting={false}
                muiTableBodyRowProps={{ hover: false }}
            />
        )
    }

    return (
        <div className="p-6">
            <MaterialReactTable
                columns={columns}
                data={data}
                state={{ isLoading }}
                renderDetailPanel={renderDetailPanel}
                enableColumnActions={false}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                    },
                }}
            />
        </div>
    )
}
