'use client'

import { CompanyVehicles } from '@prisma/client'

interface PrintLorryCalendarProps {
    data: CompanyVehicles[]
}

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const PrintLorryCalendar = ({ data }: PrintLorryCalendarProps): JSX.Element => {
    // Format date to display day and month only
    const formatDate = (dateString: string) => {
        if (dateString === 'No date') return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
        })
    }

    // Group and sort vehicles by MOT month, excluding SORN vehicles and only showing current year
    const vehiclesByMonth = MONTHS.reduce((acc, month, index) => {
        const currentYear = new Date().getFullYear()

        // Filter vehicles for this month
        const monthVehicles = data.filter((vehicle) => {
            // Skip if SORN
            if (vehicle.TAXstatus === 'SORN') return false

            // Skip if no MOT date
            if (vehicle.MOTdate === 'No date') return false

            const motDate = new Date(vehicle.MOTdate)
            // Only include if MOT is in current year and matches current month
            return (
                motDate.getFullYear() === currentYear &&
                motDate.getMonth() === index
            )
        })

        // Sort vehicles by day of month
        acc[index] = monthVehicles.sort((a, b) => {
            const dateA = new Date(a.MOTdate)
            const dateB = new Date(b.MOTdate)
            return dateA.getDate() - dateB.getDate()
        })

        return acc
    }, {} as Record<number, CompanyVehicles[]>)

    return (
        <div className="w-full h-[650px] p-1 print:h-auto">
            {/* Header */}
            <div className="text-center mb-1">
                <h1 className="text-lg font-bold">Lorry MOT Calendar</h1>
                <p className="text-xs text-gray-600">
                    Generated on{' '}
                    {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>
            {/* Grid container for months */}
            <div className="grid grid-cols-6 grid-rows-2 gap-1 h-[600px] print:h-auto">
                {MONTHS.map((month, index) => (
                    <div key={month} className="border border-gray-300 p-1">
                        <div className="font-bold text-xs mb-1 text-center border-b pb-1 bg-gray-50">
                            {month}
                        </div>
                        <div className="space-y-1 overflow-y-auto print:overflow-visible">
                            {vehiclesByMonth[index]?.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className="text-[0.65rem] py-[2px] px-1 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="font-semibold">
                                            {vehicle.registration}
                                        </div>
                                        <div className="text-gray-500">
                                            {formatDate(vehicle.MOTdate)}
                                        </div>
                                    </div>
                                    <div className="truncate">
                                        {vehicle.description}
                                    </div>
                                    <div className="text-gray-600">
                                        {vehicle.company}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PrintLorryCalendar
