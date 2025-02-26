'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { GetAllCompanyVehicles } from '@/actions/companyVehicles/company-vehicle'
import { CompanyVehicles, VehicleType } from '@prisma/client'

import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'
import { Separator } from '@/components/ui/separator'

import { BellPlus, Pencil, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import AddVehiclePopup from './add-vehicle-popup'
import ModifyVehiclePopup from './modify-vehicle-popup'
import AddReminderPopup from './add-reminder-popup'
import PrintableVehicleTable from './print-table'
import PrintLorryCalendar from './print-lorry-calendar'

// Utility function to get effective MOT days considering special statuses
const getEffectiveMOTDays = (vehicle: CompanyVehicles): number => {
    // Ignore MOT days for both 'Agri' and 'NA' statuses or if MOT date is "No date"
    if (
        vehicle.MOTstatus === 'Agri' ||
        vehicle.MOTstatus === 'NA' ||
        vehicle.MOTdate === 'No date'
    ) {
        return Infinity
    }
    return typeof vehicle.MOTdays === 'number' ? vehicle.MOTdays : Infinity
}

// Utility function to get minimum days between MOT and TAX
const getMinDays = (vehicle: CompanyVehicles): number => {
    const motDays = getEffectiveMOTDays(vehicle)

    // Ignore TAX days if TAX date is "No date"
    const taxDays =
        vehicle.TAXdate === 'No date' || typeof vehicle.TAXdays !== 'number'
            ? Infinity
            : vehicle.TAXdays

    return Math.min(motDays, taxDays)
}

// Utility function to sort vehicles by MOT/TAX days and SORN status
const sortVehicles = (a: CompanyVehicles, b: CompanyVehicles): number => {
    // If either vehicle is SORN, move it to the bottom
    if (a.TAXstatus === 'SORN' && b.TAXstatus === 'SORN') return 0
    if (a.TAXstatus === 'SORN') return 1
    if (b.TAXstatus === 'SORN') return -1

    const aMinDays = getMinDays(a)
    const bMinDays = getMinDays(b)

    // Handle edge cases where values might be Infinity
    if (aMinDays === Infinity && bMinDays === Infinity) return 0
    if (aMinDays === Infinity) return 1
    if (bMinDays === Infinity) return -1

    return aMinDays - bMinDays
}

const VehicleReminders = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<CompanyVehicles[]>([])
    const [open, setOpen] = useState(false)
    const [modifyOpen, setModifyOpen] = useState(false)
    const [remindersOpen, setRemindersOpen] = useState(false)
    const [selectedVehicleType, setSelectedVehicleType] = useState<
        VehicleType | 'All Vehicles'
    >('All Vehicles')
    const [selectedVehicle, setSelectedVehicle] =
        useState<CompanyVehicles | null>(null)
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

    // Get data
    useEffect(() => {
        if (open || modifyOpen || remindersOpen) return
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllCompanyVehicles()
                setData(data ? data : [])
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [open, modifyOpen, remindersOpen])

    // Filter and sort the data
    const filteredAndSortedData = useMemo(() => {
        // First filter by vehicle type
        const filteredData =
            selectedVehicleType === 'All Vehicles'
                ? data
                : data.filter(
                      (vehicle) => vehicle.vehicleType === selectedVehicleType
                  )

        // Then sort the filtered data
        return [...filteredData].sort(sortVehicles)
    }, [data, selectedVehicleType]) // data will update when vehicles are modified

    const componentRef = useRef(null)

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `
            @page {
                size: landscape;
                margin: ${
                    selectedVehicleType === 'Lorries' ||
                    selectedVehicleType === 'Trailers'
                        ? '5mm'
                        : '20mm'
                };
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                * {
                    box-sizing: border-box;
                }
                .grid {
                    page-break-inside: avoid;
                }
            }
        `,
        removeAfterPrint: true,
        suppressErrors: true,
    })

    // Utility function that handles 'No date' case
    const formatDate = (dateString: string | null) => {
        if (!dateString || dateString === 'No date') return 'No date'
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
        } catch (error) {
            return 'No date'
        }
    }

    const handleVehicleUpdate = () => {
        setLastUpdate(Date.now()) // Force re-sort when a vehicle is modified
    }

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
                accessorKey: 'vehicleType',
                header: 'Type',
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
                Cell: ({ cell }) => formatDate(cell.getValue<string>()),
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
                Cell: ({ cell }) => formatDate(cell.getValue<string>()),
            },
            {
                accessorKey: 'TAXdays',
                header: 'TAX Days',
                size: 40,
            },
        ],
        []
    )

    const handleVehicleTypeChange = (value: string) => {
        setSelectedVehicleType(value as VehicleType | 'All Vehicles')
    }

    return (
        <>
            <div className="mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
                {' '}
                <h1 className="font-bold text-2xl">Vehicle Reminders</h1>
                <p>
                    Create email and text reminders for MOT, Tax, servicing and
                    more
                </p>
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                    {' '}
                    <div className="flex flex-row gap-2 items-center">
                        <AddVehiclePopup open={open} setOpen={setOpen} />
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print List
                        </Button>
                        <Select
                            value={selectedVehicleType}
                            onValueChange={handleVehicleTypeChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Vehicles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Vehicles">
                                    All Vehicles
                                </SelectItem>
                                <SelectItem value="Cars">Cars</SelectItem>
                                <SelectItem value="Lorries">Lorries</SelectItem>
                                <SelectItem value="Agri">Agri</SelectItem>
                                <SelectItem value="Trailers">
                                    Trailers
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <MaterialReactTable
                        columns={columns}
                        data={filteredAndSortedData}
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
                                maxHeight: '66vh', // Set your desired height
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
                        muiTableBodyRowProps={({ row, table }) => {
                            const vehicle = row.original
                            // Check if vehicle is expiring soon (within 14 days)
                            // Only consider valid dates and non-SORN vehicles
                            const isExpiringSoon =
                                vehicle.TAXstatus !== 'SORN' &&
                                // Check MOT expiry - only if it has a valid date and not Agri/NA status
                                ((vehicle.MOTdate !== 'No date' &&
                                    vehicle.MOTstatus !== 'Agri' &&
                                    vehicle.MOTstatus !== 'NA' &&
                                    typeof vehicle.MOTdays === 'number' &&
                                    vehicle.MOTdays <= 14) ||
                                    // Check TAX expiry - only if it has a valid date
                                    (vehicle.TAXdate !== 'No date' &&
                                        typeof vehicle.TAXdays === 'number' &&
                                        vehicle.TAXdays <= 14))

                            return {
                                sx: {
                                    backgroundColor: isExpiringSoon
                                        ? 'rgba(239, 68, 68, 0.2)' // Light red background
                                        : table
                                              .getRowModel()
                                              .rows.indexOf(row) %
                                              2 ===
                                          0
                                        ? 'inherit'
                                        : 'rgba(0, 0, 0, 0.02)',
                                    '&:hover': {
                                        backgroundColor: isExpiringSoon
                                            ? 'rgba(239, 68, 68, 0.3)' // Slightly darker red on hover
                                            : 'rgba(0, 0, 0, 0.04)',
                                    },
                                },
                            }
                        }}
                    />
                    <ModifyVehiclePopup
                        open={modifyOpen}
                        setOpen={setModifyOpen}
                        vehicleData={selectedVehicle}
                        onUpdate={handleVehicleUpdate}
                    />
                    <AddReminderPopup
                        open={remindersOpen}
                        setOpen={setRemindersOpen}
                        vehicleData={selectedVehicle}
                    />
                </div>
            </div>
            {/* Hide the printable component */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    {selectedVehicleType === 'Lorries' ||
                    selectedVehicleType === 'Trailers' ? (
                        <PrintLorryCalendar
                            data={
                                // When Lorries is selected, include both Lorries and Trailers
                                selectedVehicleType === 'Lorries'
                                    ? data
                                          .filter(
                                              (vehicle) =>
                                                  vehicle.vehicleType ===
                                                      'Lorries' ||
                                                  vehicle.vehicleType ===
                                                      'Trailers'
                                          )
                                          .sort(sortVehicles)
                                    : filteredAndSortedData
                            }
                        />
                    ) : (
                        <PrintableVehicleTable data={filteredAndSortedData} />
                    )}
                </div>
            </div>
        </>
    )
}

export default VehicleReminders
