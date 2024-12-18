'use client'

import { ColumnDef } from '@tanstack/react-table'

// Define Materials type inline since we can't access the types file
type Materials = {
    code: string
    string24: string
    number4: number
    number5: number
    number3: number
}

// Define code replacements with exact codes
const codeReplacements: { [key: string]: string } = {
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
}

// Function to get display name for a code
const getDisplayName = (code: string): string => {
    return codeReplacements[code] || code
}

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

    if (ferrousItems.some((item) => code.startsWith(item))) return 'ferrous'
    if (copperItems.some((item) => code.startsWith(item))) return 'copper'
    if (copperComponents.some((item) => code.startsWith(item)))
        return 'copperComponent'
    if (brassComponents.some((item) => code.startsWith(item))) return 'brass'
    if (cableComponents.some((item) => code.startsWith(item))) return 'cable'
    if (aliComponents.some((item) => code.startsWith(item))) return 'aluminum'
    return 'other'
}

const baseStyle =
    'text-xs whitespace-nowrap overflow-hidden text-ellipsis bg-transparent print:text-[#000000] print:!text-opacity-100'

let currentCategory = ''
let isAlternate = false

export const printColumns: ColumnDef<Materials>[] = [
    {
        accessorKey: 'code',
        header: 'Material',
        cell: ({ row }) => {
            const code = row.getValue('code') as string
            const rowCategory = getMaterialCategory(code)

            if (rowCategory !== currentCategory) {
                currentCategory = rowCategory
                isAlternate = !isAlternate
            }

            return (
                <div
                    className={`w-36 h-[14px] px-2 ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    }`}
                >
                    {getDisplayName(code)}
                </div>
            )
        },
    },
    {
        accessorKey: 'string24',
        header: 'Description',
        cell: ({ cell, row }) => {
            const code = row.getValue('code') as string
            return (
                <div
                    className={`w-48 h-[14px] px-2 ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    }`}
                >
                    {cell.getValue() as string}
                </div>
            )
        },
    },
    {
        id: 'calculatedColumn',
        header: 'KG',
        cell: ({ row }) => {
            const number4Value = row.getValue('number4')
            const code = row.getValue('code') as string
            const category = getMaterialCategory(code)
            if (typeof number4Value !== 'number') return null

            const calculatedValue = (number4Value / 1000).toFixed(2)

            return (
                <div
                    className={`w-12 h-[14px] px-2 ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    } ${
                        category === 'ferrous'
                            ? 'text-gray-200 print:text-gray-200'
                            : ''
                    }`}
                >
                    <span>{calculatedValue}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'number4',
        header: 'Tonne',
        cell: ({ cell, row }) => {
            const code = row.getValue('code') as string
            const category = getMaterialCategory(code)
            if (typeof cell.getValue() !== 'number') return
            return (
                <div
                    className={`w-16 h-[14px] px-2 text-right ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    }`}
                >
                    <span>{cell.getValue() as number}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'number5',
        header: 'Selling',
        cell: ({ cell, row }) => {
            const code = row.getValue('code') as string
            if (typeof cell.getValue() !== 'number') return
            return (
                <div
                    className={`w-12 h-[14px] px-2 text-right ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    }`}
                >
                    <span>{cell.getValue() as number}</span>
                </div>
            )
        },
    },
    {
        id: 'calculatedColumn2',
        header: '',
        cell: ({ row }) => {
            const code = row.getValue('code') as string
            return (
                <div
                    className={`w-4 h-[14px] ${baseStyle} ${
                        isAlternate ? 'bg-gray-100' : 'bg-white'
                    }`}
                ></div>
            )
        },
    },
]
