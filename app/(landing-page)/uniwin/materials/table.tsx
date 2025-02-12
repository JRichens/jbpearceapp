'use client'

import React from 'react'
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Cell,
    type MRT_Row,
} from 'material-react-table'
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
    // Define code replacements with exact codes
    const codeReplacements = React.useMemo<{ [key: string]: string }>(
        () => ({
            // Ferrous replacements
            BDISC: 'Brake Discs',
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
            HARDDRAWN: 'Harddrawn Cu Wire',
            GB: 'Greasy bright',
            '98%': 'Heavy Cu 98%',
            'NO 2 WIRE': 'No2 CU Wire',
            CTANK: 'Cu Cylinders',
            BZC: 'Braziery Cu',
            'L WASH': 'Lead Washed Rads',
            // copComponents replacements
            PYRO: 'Clean Pyro',
            ELEMENTS: 'Elements',
            MOT: 'Electric Motors',
            // brassComponents replacements
            BM: 'Mixed Brass/Honey',
            BCR: 'Brass/Cu Rads/Ocean',
            GM: 'Gunmetal',
            // cableComponets replacements
            'LOW GRADE': 'Low Grade Cable',
            PVC: 'Household Cable',
            'PVC DATA CABLE': 'Data Cable',
            AC: 'Armoured Cable',
            // aliComponents replacements
            ALIW: 'Clean Ali Wheels',
            'ALLY CAST': 'Cast Ali',
            ALI: 'Mxd Ali',
            ALT: 'Comm Ali Swarf',
            ACR: 'Ali/Cu Rads',
            'AL RADS': 'Ali Rads',
            IALI: 'Irony Ali',
            'IALI CAR': 'Irony Ali',
            // otherComponents replacements
            STST: 'Stainless Steel',
            ZINC: 'Zinc',
            LEAD: 'Lead',
            BAT: 'Batteries',
        }),
        [] // Empty dependency array since this object never needs to change
    )

    // Function to determine material category
    const getMaterialCategory = (code: string): string => {
        // Define category arrays
        const ferrousItems = [
            'BDISC',
            'HIRON',
            'OS`',
            'SHEARING',
            'MM',
            'LIGHT MIX',
            'LI',
            'SC',
        ]
        const copperItems = [
            'C BRIGHT',
            'BUZZBAR',
            'CT',
            'HARDDRAWN',
            'GB',
            '98%',
            'NO 2 WIRE',
            'CTANK',
            'BZC',
            'L WASH',
        ]
        const copperComponents = ['PYRO', 'ELEMENTS', 'MOT']
        const brassComponents = ['BM', 'BCR', 'GM']
        const cableComponents = ['LOW GRADE', 'PVC', 'PVC DATA CABLE', 'AC']
        const aliComponents = [
            'ALIW',
            'ALLY CAST',
            'ALI',
            'ALT',
            'ACR',
            'AL RADS',
            'IALI',
            'IALI CAR',
        ]
        const otherComponents = ['STST', 'ZINC', 'LEAD', 'BAT']

        // Special cases that need exact matching
        const specialCases = ['ACR', '98%', 'NO 2 WIRE']
        if (specialCases.includes(code)) {
            if (aliComponents.includes(code)) return 'aluminum'
            if (copperItems.includes(code)) return 'copper'
        }

        // Regular cases that can use startsWith
        if (ferrousItems.some((item) => code.startsWith(item))) return 'ferrous'
        if (copperItems.some((item) => code.startsWith(item))) return 'copper'
        if (copperComponents.some((item) => code.startsWith(item)))
            return 'copperComponent'
        if (brassComponents.some((item) => code.startsWith(item)))
            return 'brass'
        if (cableComponents.some((item) => code.startsWith(item)))
            return 'cable'
        if (aliComponents.some((item) => code.startsWith(item)))
            return 'aluminum'
        return 'other'
    }

    const columns = React.useMemo<MRT_ColumnDef<Materials>[]>(
        () => [
            {
                header: 'Seller Code',
                accessorKey: 'code',
                size: 30,
                Cell: ({ cell }: { cell: MRT_Cell<Materials> }) => {
                    const getDisplayName = (code: string): string => {
                        return codeReplacements[code] || code
                    }
                    return getDisplayName(cell.getValue<string>())
                },
            },
            {
                header: 'UniWin Description',
                accessorKey: 'string24',
            },
            {
                header: 'Selling',
                accessorKey: 'number5',
                size: 30,
                Cell: ({
                    cell,
                    row,
                }: {
                    cell: MRT_Cell<Materials>
                    row: MRT_Row<Materials>
                }) => (
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
                Cell: ({
                    cell,
                    row,
                }: {
                    cell: MRT_Cell<Materials>
                    row: MRT_Row<Materials>
                }) => (
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
                Cell: ({ cell }: { cell: MRT_Cell<Materials> }) => (
                    <div className="w-20 textRight">
                        {cell.getValue<number>()?.toLocaleString() ?? '0'}
                    </div>
                ),
            },
        ],
        [tableData, setTableData, codeReplacements]
    )

    return (
        <>
            <MaterialReactTable
                columns={columns}
                data={tableData}
                initialState={{
                    density: 'compact',
                    pagination: { pageIndex: 0, pageSize: 100 },
                }}
                enableSorting={false}
                muiTableBodyRowProps={({ row }) => ({
                    sx: {
                        backgroundColor:
                            getMaterialCategory(row.original.code) === 'ferrous'
                                ? '#f1f5f9' // slate-100 for ferrous
                                : getMaterialCategory(row.original.code) ===
                                  'copper'
                                ? '#fff7ed' // orange-50 for copper
                                : getMaterialCategory(row.original.code) ===
                                  'copperComponent'
                                ? '#fef2f2' // red-50 for copper components
                                : getMaterialCategory(row.original.code) ===
                                  'brass'
                                ? '#f0fdf4' // green-50 for brass components
                                : getMaterialCategory(row.original.code) ===
                                  'cable'
                                ? '#faf5ff' // purple-50 for cable components
                                : getMaterialCategory(row.original.code) ===
                                  'aluminum'
                                ? '#f0f9ff' // sky-50 for aluminum components
                                : '#f8fafc', // slate-50 for other
                        '&:hover': {
                            backgroundColor:
                                getMaterialCategory(row.original.code) ===
                                'ferrous'
                                    ? '#e2e8f0' // slate-200 for ferrous hover
                                    : getMaterialCategory(row.original.code) ===
                                      'copper'
                                    ? '#fed7aa' // orange-200 for copper hover
                                    : getMaterialCategory(row.original.code) ===
                                      'copperComponent'
                                    ? '#fecaca' // red-200 for copper components hover
                                    : getMaterialCategory(row.original.code) ===
                                      'brass'
                                    ? '#bbf7d0' // green-200 for brass components hover
                                    : getMaterialCategory(row.original.code) ===
                                      'cable'
                                    ? '#e9d5ff' // purple-200 for cable components hover
                                    : getMaterialCategory(row.original.code) ===
                                      'aluminum'
                                    ? '#bae6fd' // sky-200 for aluminum components hover
                                    : '#e2e8f0', // slate-200 for other hover
                        },
                    },
                })}
            />
        </>
    )
}

export default MaterialsComponent
