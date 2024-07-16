'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'
import { Input } from '@/components/ui/input'
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
    const columns = useMemo<MRT_ColumnDef<Materials>[]>(
        () => [
            {
                header: 'Code',
                accessorKey: 'code',
                size: 30,
            },
            {
                header: 'Description',
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
                data={tableData}
                initialState={{
                    density: 'compact',
                    pagination: { pageIndex: 0, pageSize: 100 },
                }}
            />
        </>
    )
}

export default MaterialsComponent
