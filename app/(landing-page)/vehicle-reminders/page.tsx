'use client'

import { useEffect, useMemo, useState } from 'react'
import { GetAllCompanyVehicles } from '@/actions/companyVehicles/company-vehicle'
import { CompanyVehicles } from '@prisma/client'

import AddVehiclePopup from './add-vehicle-popup'
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const VehicleReminders = () => {
    const [data, setData] = useState<CompanyVehicles[]>([])
    const [open, setOpen] = useState(false)
    const [companyFilter, setCompanyFilter] = useState('')

    // Get data
    useEffect(() => {
        const fetchData = async () => {
            const data = await GetAllCompanyVehicles()
            setData(data ? data : [])
        }
        fetchData()

        const checkDvlaData = async () => {
            for (const vehicle of data) {
                // Loop through each vehicle and call the API to get the MOT and TAX dates
                const response = await fetch(
                    `/api/companyvehicles/${vehicle.registration}`,
                    {
                        method: 'GET',
                    }
                )
            }
        }

        checkDvlaData()

        // Refresh data every 3 seconds
        // const interval = setInterval(fetchData, 3000)
        // return () => clearInterval(interval)
    }, [])

    const columns = useMemo<MRT_ColumnDef<CompanyVehicles>[]>(
        () => [
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
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="J B Pearce">
                                    J B Pearce
                                </SelectItem>
                                <SelectItem value="Gradeacre">
                                    Gradeacre
                                </SelectItem>
                                <SelectItem value="Farm">Farm</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <MaterialReactTable
                    columns={columns}
                    data={data}
                    initialState={{
                        density: 'compact',
                        pagination: { pageIndex: 0, pageSize: 50 },
                    }}
                />
            </div>
        </div>
    )
}

export default VehicleReminders
