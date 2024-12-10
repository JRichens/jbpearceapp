'use client'

import React, { useMemo } from 'react'
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import SellingInput from './sellingInput'
import MarginInput from './marginInput'

type Materials = {
    code: string
    string24: string
    number4: number
    number5: number
    number3: number
}

type Props = {
    tableData: Materials[]
    setTableData: React.Dispatch<React.SetStateAction<Materials[]>>
}

const MaterialsComponent = ({ tableData, setTableData }: Props) => {
    // Define the priority orders for different categories
    const ferrousPriorityOrder = [
        'HIRON',
        'OS`',
        'SHEARING',
        'MM',
        'LIGHT MIX',
        'LI',
        'SC',
    ]

    const copperPriorityOrder = [
        'C BRIGHT',
        'BUZZBAR',
        'CT',
        'GB',
        '98%',
        'NO 2 WIRE',
        'CTANK',
        'BZC',
        'L WASH',
    ]

    // Define code replacements with exact codes
    const codeReplacements: { [key: string]: string } = {
        // Ferrous replacements
        HIRON: 'O/A - Plate & Girder',
        'OS`': 'O/A - Plate & Girder',
        SHEARING: 'No 1&2',
        MM: 'MM',
        'LIGHT MIX': 'Light Iron',
        LI: 'Light Iron',
        SC: 'ELVS',
        // Copper replacements
        'C BRIGHT': 'Dry Bright Cu Wire',
        BUZZBAR: 'Clean Flat Electro Cu',
        CT: 'New Cu Tube Candy',
        GB: 'Greasy bright',
        '98%': 'Heavy Cu 98%',
        'NO 2 WIRE': 'No2 CU Wire',
        CTANK: 'Cu Cylinders',
        BZC: 'Braziery Cu',
        'L WASH': 'Lead Washed Rads',
    }

    // Function to get the matching code from our defined codes
    const getMatchingCode = (code: string): string => {
        // First try exact match
        if (Object.keys(codeReplacements).includes(code)) {
            return code
        }

        // Then try to match against the start of the code
        return (
            Object.keys(codeReplacements).find((key) => {
                // For special cases like '98%' and 'NO 2 WIRE', use exact match
                if (key === '98%' || key === 'NO 2 WIRE') {
                    return code === key
                }
                // For other codes, match the start but ensure it's a complete word
                const regex = new RegExp(`^${key}(?:[0-9]|$)`)
                return regex.test(code)
            }) || code
        )
    }

    // Function to get display name for a code
    const getDisplayName = (code: string): string => {
        const matchingCode = getMatchingCode(code)
        return codeReplacements[matchingCode] || code
    }

    // Function to determine material category
    const getMaterialCategory = (
        code: string
    ): 'ferrous' | 'copper' | 'other' => {
        const matchingCode = getMatchingCode(code)

        if (ferrousPriorityOrder.includes(matchingCode)) {
            return 'ferrous'
        }
        if (copperPriorityOrder.includes(matchingCode)) {
            return 'copper'
        }
        return 'other'
    }

    // Create a sorting function based on priority
    const sortByPriority = (a: Materials, b: Materials): number => {
        const aCategory = getMaterialCategory(a.code)
        const bCategory = getMaterialCategory(b.code)

        // If materials are in different categories
        if (aCategory !== bCategory) {
            if (aCategory === 'ferrous') return -1
            if (bCategory === 'ferrous') return 1
            if (aCategory === 'copper') return -1
            if (bCategory === 'copper') return 1
            return 0
        }

        const aMatchingCode = getMatchingCode(a.code)
        const bMatchingCode = getMatchingCode(b.code)

        // If both are ferrous, sort by ferrous priority
        if (aCategory === 'ferrous') {
            const aIndex = ferrousPriorityOrder.indexOf(aMatchingCode)
            const bIndex = ferrousPriorityOrder.indexOf(bMatchingCode)
            return aIndex - bIndex
        }

        // If both are copper, sort by copper priority
        if (aCategory === 'copper') {
            const aIndex = copperPriorityOrder.indexOf(aMatchingCode)
            const bIndex = copperPriorityOrder.indexOf(bMatchingCode)
            return aIndex - bIndex
        }

        // For other materials, maintain original order
        return 0
    }

    // Sort the table data
    const sortedData = [...tableData].sort(sortByPriority)

    const columns = useMemo<MRT_ColumnDef<Materials>[]>(
        () => [
            {
                header: 'UniWin Code',
                accessorKey: 'code',
                size: 30,
                Cell: ({ cell }) => getDisplayName(cell.getValue() as string),
            },
            {
                header: 'UniWin',
                accessorKey: 'string24',
            },
            {
                header: 'Selling',
                accessorKey: 'number5',
                size: 30,
                Cell: ({ cell, row }) => (
                    <div className="flex gap-2">
                        <SellingInput
                            cell={cell}
                            row={row}
                            data={tableData}
                            setData={setTableData}
                        />
                    </div>
                ),
            },
            {
                header: 'Margin',
                accessorKey: 'number3',
                size: 30,
                Cell: ({ cell, row }) => (
                    <MarginInput
                        cell={cell}
                        row={row}
                        data={tableData}
                        setData={setTableData}
                    />
                ),
            },
            {
                header: 'Buying',
                accessorKey: 'number4',
                size: 30,
                Cell: ({ cell }) => (
                    <div className="w-20 textRight">
                        {cell.getValue<number>().toLocaleString()}
                    </div>
                ),
            },
        ],
        [tableData]
    )

    return (
        <>
            <MaterialReactTable
                columns={columns}
                data={sortedData}
                initialState={{
                    density: 'compact',
                    pagination: { pageIndex: 0, pageSize: 100 },
                    sorting: [{ id: 'code', desc: false }],
                }}
                enableSorting={false}
                muiTableBodyRowProps={({ row }) => ({
                    sx: {
                        backgroundColor:
                            getMaterialCategory(row.original.code) === 'ferrous'
                                ? '#f1f5f9' // slate-100 for ferrous
                                : getMaterialCategory(row.original.code) ===
                                  'copper'
                                ? '#fff7ed' // orange-50 for copper (very light orange)
                                : 'inherit',
                        '&:hover': {
                            backgroundColor:
                                getMaterialCategory(row.original.code) ===
                                'ferrous'
                                    ? '#e2e8f0' // slate-200 for ferrous hover
                                    : getMaterialCategory(row.original.code) ===
                                      'copper'
                                    ? '#fed7aa' // orange-200 for copper hover (slightly darker orange)
                                    : '#f8fafc',
                        },
                    },
                })}
            />
        </>
    )
}

export default MaterialsComponent
