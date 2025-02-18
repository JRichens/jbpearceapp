'use client'

import React, { useEffect, useRef } from 'react'
import useSWR from 'swr'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { printColumns } from './_components/printColumns'
import { DataTable } from './_components/data-table'
import { NavMenu } from '../nav-menu'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import ReactToPrint from 'react-to-print'
import { Button } from '@/components/ui/button'
import { PrinterIcon, ArrowUpDown } from 'lucide-react'
import { Materials } from '@/types/uniwindata'
import MaterialsComponent from './table'
import { Skeleton } from '@/components/ui/skeleton'

// Define the priority orders for different categories
const ferrousPriorityOrder = [
    'BDISC',
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
const cableComponents = [
    'LOW GRADE',
    'PVC',
    'PVC DATA CABLE',
    'PVC SINGLES',
    'AC',
]
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

// Function to get the matching code
const getMatchingCode = (code: string): string => {
    const allCodes = [
        ...ferrousPriorityOrder,
        ...copperPriorityOrder,
        ...copperComponents,
        ...brassComponents,
        ...cableComponents,
        ...aliComponents,
        ...otherComponents,
    ]

    // First try exact match
    if (allCodes.includes(code)) {
        return code
    }

    // Then try to match against the start of the code
    return (
        allCodes.find((key) => {
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

// Function to determine material category
const getMaterialCategory = (code: string): string => {
    const matchingCode = getMatchingCode(code)

    if (ferrousPriorityOrder.includes(matchingCode)) return 'ferrous'
    if (copperPriorityOrder.includes(matchingCode)) return 'copper'
    if (copperComponents.includes(matchingCode)) return 'copperComponent'
    if (brassComponents.includes(matchingCode)) return 'brass'
    if (cableComponents.includes(matchingCode)) return 'cable'
    if (aliComponents.includes(matchingCode)) return 'aluminum'
    if (otherComponents.includes(matchingCode)) return 'other'
    return 'unknown'
}

// Sorting function
const sortMaterials = (
    a: Materials,
    b: Materials,
    useAlphaSort: boolean
): number => {
    const aCategory = getMaterialCategory(a.code)
    const bCategory = getMaterialCategory(b.code)

    // If materials are in different categories
    if (aCategory !== bCategory) {
        if (aCategory === 'ferrous') return -1
        if (bCategory === 'ferrous') return 1
        if (aCategory === 'copper') return -1
        if (bCategory === 'copper') return 1
        if (aCategory === 'copperComponent') return -1
        if (bCategory === 'copperComponent') return 1
        if (aCategory === 'brass') return -1
        if (bCategory === 'brass') return 1
        if (aCategory === 'cable') return -1
        if (bCategory === 'cable') return 1
        if (aCategory === 'aluminum') return -1
        if (bCategory === 'aluminum') return 1
        if (aCategory === 'other') return -1
        if (bCategory === 'other') return 1
        return 0
    }

    // If alpha sort is enabled and categories are the same, sort by description
    if (useAlphaSort) {
        return a.string24.localeCompare(b.string24)
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

    // If both are copper components, sort by copper components priority
    if (aCategory === 'copperComponent') {
        const aIndex = copperComponents.indexOf(aMatchingCode)
        const bIndex = copperComponents.indexOf(bMatchingCode)
        return aIndex - bIndex
    }

    // If both are brass components, sort by brass priority
    if (aCategory === 'brass') {
        const aIndex = brassComponents.indexOf(aMatchingCode)
        const bIndex = brassComponents.indexOf(bMatchingCode)
        return aIndex - bIndex
    }

    // If both are cable components, sort by cable priority
    if (aCategory === 'cable') {
        const aIndex = cableComponents.indexOf(aMatchingCode)
        const bIndex = cableComponents.indexOf(bMatchingCode)
        return aIndex - bIndex
    }

    // If both are aluminum components, sort by aluminum priority
    if (aCategory === 'aluminum') {
        const aIndex = aliComponents.indexOf(aMatchingCode)
        const bIndex = aliComponents.indexOf(bMatchingCode)
        return aIndex - bIndex
    }

    // If both are other components, sort by other priority
    if (aCategory === 'other') {
        const aIndex = otherComponents.indexOf(aMatchingCode)
        const bIndex = otherComponents.indexOf(bMatchingCode)
        return aIndex - bIndex
    }

    // For unknown categories, maintain original order
    return 0
}

const fetcher = (url: string) =>
    fetch(url, {
        method: 'GET',
        headers: {
            'ngrok-skip-browser-warning': '69420',
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json())

const MaterialsPage = () => {
    const [isAlphaSort, setIsAlphaSort] = React.useState(false)

    // Load sort preference from localStorage on mount
    React.useEffect(() => {
        const savedSort = localStorage.getItem('materialsAlphaSort')
        if (savedSort !== null) {
            setIsAlphaSort(JSON.parse(savedSort))
        }
    }, [])

    const { data, isLoading, error } = useSWR<Materials[]>(
        'https://genuine-calf-newly.ngrok-free.app/materials',
        fetcher
    )

    const [tableData, setTableData] = React.useState<Materials[]>([])

    // Toggle alpha sort and save to localStorage
    const toggleAlphaSort = () => {
        const newValue = !isAlphaSort
        setIsAlphaSort(newValue)
        localStorage.setItem('materialsAlphaSort', JSON.stringify(newValue))
    }

    useEffect(() => {
        if (data) {
            // Sort the data before setting it to state
            const sortedData = [...data].sort((a, b) =>
                sortMaterials(a, b, isAlphaSort)
            )
            setTableData(sortedData)
        }
    }, [data, isAlphaSort])

    const ComponentToPrint = React.forwardRef<HTMLDivElement>((_, ref) => (
        <div ref={ref}>
            <DataTable columns={printColumns} data={tableData} />
        </div>
    ))

    ComponentToPrint.displayName = 'ComponentToPrint'

    const componentRef = useRef<HTMLDivElement>(null)

    return (
        <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
            <div className="pl-2">
                <NavMenu />
            </div>
            <Separator />
            <CardHeader>
                <CardTitle>Materials File</CardTitle>
                <CardDescription>
                    Adjust selling prices here to automatically calculate paying
                    value
                </CardDescription>
                <div className="flex gap-2">
                    <ReactToPrint
                        trigger={() => (
                            <Button variant="outline">
                                <PrinterIcon className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        )}
                        content={() => componentRef.current}
                        pageStyle={`@page {size: 210mm 297mm; margin: 30;}`}
                    />
                    <Button
                        variant="outline"
                        onClick={toggleAlphaSort}
                        className={isAlphaSort ? 'bg-slate-200' : ''}
                    >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        A-Z Sort
                    </Button>
                    <div style={{ display: 'none' }}>
                        <ComponentToPrint ref={componentRef} />
                    </div>
                </div>
            </CardHeader>
            <div className="px-6 pb-6">
                {error && <div>failed to load</div>}
                {isLoading && (
                    <div className="flex flex-col gap-2 border border-slate-200 rounded-md shadow-sm p-4">
                        <div className="flex flex-row gap-4">
                            <Skeleton className="w-[25%] h-10 rounded-md" />
                            <Skeleton className="w-[40%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                        </div>
                        <div className="flex flex-row gap-4">
                            <Skeleton className="w-[25%] h-10 rounded-md" />
                            <Skeleton className="w-[40%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                        </div>
                        <div className="flex flex-row gap-4">
                            <Skeleton className="w-[25%] h-10 rounded-md" />
                            <Skeleton className="w-[40%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                            <Skeleton className="w-[10%] h-10 rounded-md" />
                        </div>
                    </div>
                )}
                {data && (
                    <MaterialsComponent
                        tableData={tableData}
                        setTableData={setTableData}
                    />
                )}
            </div>
        </Card>
    )
}

export default MaterialsPage
