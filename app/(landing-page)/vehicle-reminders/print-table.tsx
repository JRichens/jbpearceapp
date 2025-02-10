'use client'

import { CompanyVehicles } from '@prisma/client'

interface PrintableVehicleTableProps {
    data: CompanyVehicles[]
}

const PrintableVehicleTable = ({ data }: PrintableVehicleTableProps) => {
    // Sort the data by company name
    const sortedData = [...data].sort((a, b) => {
        // Handle null or undefined company names
        const companyA = (a.company || '').toLowerCase()
        const companyB = (b.company || '').toLowerCase()

        return companyA.localeCompare(companyB)
    })

    return (
        <div className="p-4 text-sm">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Registration</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Company</th>
                        <th className="border p-2">Type</th>
                        <th className="border p-2">MOT Status</th>
                        <th className="border p-2">MOT Date</th>
                        <th className="border p-2">MOT Days</th>
                        <th className="border p-2">TAX Status</th>
                        <th className="border p-2">TAX Date</th>
                        <th className="border p-2">TAX Days</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((vehicle) => (
                        <tr key={vehicle.id}>
                            <td className="border p-2">
                                {vehicle.registration}
                            </td>
                            <td className="border p-2">
                                {vehicle.description}
                            </td>
                            <td className="border p-2">{vehicle.company}</td>
                            <td className="border p-2">
                                {vehicle.vehicleType}
                            </td>
                            <td className="border p-2">{vehicle.MOTstatus}</td>
                            <td className="border p-2">{vehicle.MOTdate}</td>
                            <td className="border p-2">{vehicle.MOTdays}</td>
                            <td className="border p-2">{vehicle.TAXstatus}</td>
                            <td className="border p-2">{vehicle.TAXdate}</td>
                            <td className="border p-2">{vehicle.TAXdays}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default PrintableVehicleTable
