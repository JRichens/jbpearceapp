'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
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

    if (ferrousItems.some((item) => code.startsWith(item))) return 'ferrous'
    if (copperItems.some((item) => code.startsWith(item))) return 'copper'
    if (copperComponents.some((item) => code.startsWith(item)))
        return 'copperComponent'
    if (brassComponents.some((item) => code.startsWith(item))) return 'brass'
    if (cableComponents.some((item) => code.startsWith(item))) return 'cable'
    if (aliComponents.some((item) => code.startsWith(item))) return 'aluminum'
    return 'other'
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    let currentCategory = ''
    let isAlternate = false

    return (
        <div className="rounded-md border print:border-none">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            const rowCategory = getMaterialCategory(
                                (row.original as any).code
                            )

                            // Toggle isAlternate when category changes
                            if (rowCategory !== currentCategory) {
                                currentCategory = rowCategory
                                isAlternate = !isAlternate
                            }

                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className={cn(
                                        isAlternate
                                            ? 'bg-gray-100 print:bg-gray-100'
                                            : 'bg-white',
                                        'hover:bg-gray-50 print:hover:bg-inherit'
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-1"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
