'use client'

import React, { useMemo } from 'react'
import { Reminders } from '@prisma/client'
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import { Button } from '@/components/ui/button'

interface ExpandedRowContentProps {
    reminders: Reminders[]
}

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
    reminders,
}) => {
    const columns = useMemo<MRT_ColumnDef<Reminders>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
            },
            {
                accessorKey: 'dueDate',
                header: 'Due Date',
                Cell: ({ cell }) =>
                    new Date(cell.getValue<string>()).toLocaleDateString(),
            },
            {
                accessorKey: 'completed',
                header: 'Status',
                Cell: ({ cell }) =>
                    cell.getValue<boolean>() ? 'Completed' : 'Pending',
            },
        ],
        []
    )

    return (
        <div className="p-2">
            {reminders.length > 0 ? (
                <MaterialReactTable
                    columns={columns}
                    data={reminders}
                    initialState={{
                        density: 'compact',
                        pagination: { pageIndex: 0, pageSize: 5 },
                    }}
                    enableTopToolbar={false}
                    enableBottomToolbar={false}
                    enableColumnActions={false}
                    enableColumnFilters={false}
                    enablePagination={false}
                    enableSorting={false}
                    muiTableBodyRowProps={{ hover: false }}
                />
            ) : (
                <div className="flex flex-col gap-2">
                    <p>No reminders for this vehicle.</p>
                    <Button className="w-32">+ Add Reminder</Button>
                </div>
            )}
        </div>
    )
}

export default ExpandedRowContent
