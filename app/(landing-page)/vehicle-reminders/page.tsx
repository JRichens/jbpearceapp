'use client'

import { useEffect, useMemo, useState } from 'react'
import { GetAllCompanyVehicles } from '@/actions/companyVehicles/company-vehicle'
import { CompanyVehicles } from '@prisma/client'

import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'
import { Separator } from '@/components/ui/separator'

import { BellPlus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddVehiclePopup from './add-vehicle-popup'
import ModifyVehiclePopup from './modify-vehicle-popup'
import AddReminderPopup from './add-reminder-popup'

const VehicleReminders = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<CompanyVehicles[]>([])
    const [open, setOpen] = useState(false)
    const [modifyOpen, setModifyOpen] = useState(false)
    const [remindersOpen, setRemindersOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] =
        useState<CompanyVehicles | null>(null)

    // Get data
    useEffect(() => {
        if (open || modifyOpen || remindersOpen) return
        const fetchData = async () => {
            setIsLoading(true) // Set loading to true before fetching
            try {
                const data = await GetAllCompanyVehicles()
                setData(data ? data : [])
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false) // Set loading to false after fetching
            }
        }
        fetchData()
    }, [open, modifyOpen, remindersOpen])

    const columns = useMemo<MRT_ColumnDef<CompanyVehicles>[]>(
        () => [
            {
                accessorKey: 'reminder',
                header: 'Reminder',
                size: 50,
                enableSorting: false,
                enableColumnActions: false,
                Cell: ({ row }) => (
                    <div className="flex items-center justify-center w-full">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSelectedVehicle(row.original)
                                setRemindersOpen(true)
                            }}
                            className="-my-2 -p-1 hover:text-red-700"
                        >
                            <BellPlus className="h-5 w-5" />
                        </Button>
                    </div>
                ),
            },
            {
                accessorKey: 'actions',
                header: 'Modify',
                size: 50,
                enableSorting: false,
                enableColumnActions: false,
                Cell: ({ row }) => (
                    <div className="flex items-center justify-center w-full">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSelectedVehicle(row.original)
                                setModifyOpen(true)
                            }}
                            className="-my-2 -p-1 hover:text-blue-700"
                        >
                            <Pencil className="h-5 w-5" />
                        </Button>
                    </div>
                ),
            },
            {
                accessorKey: 'registration',
                header: 'Registration',
                size: 50,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                size: 120,
            },
            {
                accessorKey: 'company',
                header: 'Company',
                size: 40,
            },
            {
                accessorKey: 'MOTstatus',
                header: 'MOT Status',
                size: 40,
            },
            {
                accessorKey: 'MOTdate',
                header: 'MOT Date',
                size: 40,
            },
            {
                accessorKey: 'MOTdays',
                header: 'MOT Days',
                size: 40,
            },
            {
                accessorKey: 'TAXstatus',
                header: 'TAX Status',
                size: 40,
            },
            {
                accessorKey: 'TAXdate',
                header: 'TAX Date',
                size: 40,
            },
            {
                accessorKey: 'TAXdays',
                header: 'TAX Days',
                size: 40,
            },
        ],
        []
    )

    return (
        <div className="mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
            <h1 className="font-bold text-2xl">Vehicle Reminders</h1>
            <p>
                Create email and text reminders for MOT, Tax, servicing and more
            </p>
            <Separator className="my-2" />
            <div className="flex flex-col gap-2">
                {' '}
                <div className="flex flex-row gap-2">
                    <AddVehiclePopup open={open} setOpen={setOpen} />
                </div>
                <MaterialReactTable
                    columns={columns}
                    data={data}
                    renderEmptyRowsFallback={() => (
                        <div className="flex items-center justify-center h-[400px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-2 mt-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                                    <p>Loading vehicles...</p>
                                </div>
                            ) : (
                                <p>No vehicles found</p>
                            )}
                        </div>
                    )}
                    initialState={{
                        density: 'compact',
                        pagination: { pageIndex: 0, pageSize: 50 },
                    }}
                    muiTableContainerProps={{
                        sx: {
                            maxHeight: '500px', // Set your desired height
                        },
                    }}
                    muiTableHeadProps={{
                        sx: {
                            position: 'sticky',
                            top: 0,
                            backgroundColor: 'white', // Or any color that matches your design
                            zIndex: 1,
                        },
                    }}
                    muiTableBodyRowProps={({ row, table }) => ({
                        sx: {
                            backgroundColor:
                                table.getRowModel().rows.indexOf(row) % 2 === 0
                                    ? 'inherit'
                                    : 'rgba(0, 0, 0, 0.02)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        },
                    })}
                />
                <ModifyVehiclePopup
                    open={modifyOpen}
                    setOpen={setModifyOpen}
                    vehicleData={selectedVehicle}
                />
                <AddReminderPopup
                    open={remindersOpen}
                    setOpen={setRemindersOpen}
                    vehicleData={selectedVehicle}
                />
            </div>
        </div>
    )
}

export default VehicleReminders
