'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { CompanyVehicles, MOTStatus, TAXStatus } from '@prisma/client' // Import your Prisma type

export async function AddCompanyVehicle(
    reg: string,
    desc: string,
    company: string
) {
    // Validate that a userId is present.
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    // Create the vehicle
    try {
        const companyVehicle = await db.companyVehicles.create({
            data: {
                registration: reg,
                description: desc,
                company: company,
            },
        })
        return companyVehicle
    } catch (error) {
        console.error('Error', error)
    }
}

export async function GetAllCompanyVehicles() {
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    try {
        const companyVehicles = await db.companyVehicles.findMany()

        // Check if companyVehicles exists and has items
        if (!companyVehicles || companyVehicles.length === 0) {
            console.log('No vehicles found in the database')
            return []
        }

        const vehiclesWithTaxDates = await Promise.all(
            companyVehicles.map(async (vehicle: CompanyVehicles) => {
                // Validate vehicle object
                if (!vehicle || !vehicle.registration) {
                    console.error('Invalid vehicle data:', vehicle)
                    return null
                }

                // Handle MOT status updates (because we may have MOT Ignores, but not TAX Ignores)
                if (vehicle.MOTstatus === 'Ignore') {
                    await db.companyVehicles.update({
                        where: { id: vehicle.id },
                        data: {
                            MOTdate: 'No date',
                            MOTdays: 0,
                        },
                    })
                }

                // Handle TAX status updates (If MOT ignore, likely SORN, so just update and return)
                if (vehicle.TAXstatus === 'Ignore') {
                    return await db.companyVehicles.update({
                        where: { id: vehicle.id },
                        data: {
                            TAXdate: 'No date',
                            TAXdays: 0,
                        },
                    })
                }

                // Fetch vehicle data from API
                try {
                    const response = await fetch(
                        'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
                        {
                            method: 'POST',
                            headers: {
                                'x-api-key':
                                    'lF3zjCub9ZBABWYWNGES7aPt0QVMEYYaGI4LgjFi',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                registrationNumber: vehicle.registration,
                            }),
                        }
                    )

                    if (!response.ok) {
                        console.log(
                            `Error fetching vehicle data for ${vehicle.registration}: ${response.statusText}`
                        )
                        return vehicle
                    }

                    const data = await response.json()

                    // Handle MOT status
                    if (vehicle.MOTstatus !== 'Ignore') {
                        // Check if we have an expiry date, if so update database
                        if (data.motExpiryDate) {
                            const motDate = new Date(data.motExpiryDate)
                            const today = new Date()
                            const MOTdays = Math.round(
                                (motDate.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                            )
                            const MOTstatus = MOTdays > 0 ? 'Valid' : 'Expired'
                            const formattedDate = motDate
                                .toISOString()
                                .split('T')[0]
                            await db.companyVehicles.update({
                                where: { id: vehicle.id },
                                data: {
                                    MOTstatus: MOTstatus,
                                    MOTdate: formattedDate,
                                    MOTdays: MOTdays,
                                },
                            })
                        }
                        if (vehicle.MOTdate !== 'No date') {
                            const motDate = new Date(vehicle.MOTdate)
                            const today = new Date()
                            const MOTdays = Math.round(
                                (motDate.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                            )
                            const MOTstatus = MOTdays > 0 ? 'Valid' : 'Expired'
                            await db.companyVehicles.update({
                                where: { id: vehicle.id },
                                data: {
                                    MOTstatus: MOTstatus,
                                    MOTdays: MOTdays,
                                },
                            })
                        }
                    }

                    if (data.taxStatus === 'SORN') {
                        // Handle SORN status
                        return await db.companyVehicles.update({
                            where: { id: vehicle.id },
                            data: {
                                TAXstatus: 'SORN',
                                TAXdate: 'No date',
                                TAXdays: 0,
                            },
                        })
                    }

                    // Handle Taxed status
                    if (data.taxStatus === 'Taxed') {
                        return await db.companyVehicles.update({
                            where: { id: vehicle.id },
                            data: {
                                TAXstatus: 'Taxed',
                                TAXdate: data.taxDueDate,
                                TAXdays: Math.round(
                                    (new Date(data.taxDueDate).getTime() -
                                        Date.now()) /
                                        (1000 * 60 * 60 * 24)
                                ),
                            },
                        })
                    }

                    // Return original vehicle if no status match
                    return vehicle
                } catch (error) {
                    console.error(
                        `Error processing vehicle ${vehicle.registration}:`,
                        error
                    )
                    return vehicle
                }
            })
        )

        // Filter out null values
        const validVehicles = vehiclesWithTaxDates.filter(
            (vehicle): vehicle is CompanyVehicles => vehicle !== null
        )

        // console.log('Updated Company Vehicles:')
        // console.table(validVehicles, [
        //     'registration',
        //     'description',
        //     'company',
        //     'taxDueDate',
        //     'TAXdays',
        // ])

        return validVehicles
    } catch (error) {
        console.error('Error in GetAllCompanyVehicles:', error)
        throw error
    }
}

const COMPANY_OPTIONS = ['J B Pearce', 'Farm', 'Gradeacre'] as const
type CompanyType = (typeof COMPANY_OPTIONS)[number]

export async function UpdateCompanyVehicle({
    registration,
    company,
    description,
    MOTstatus,
    MOTdate,
    TAXstatus,
    TAXdate,
}: {
    registration: string
    company: CompanyType | ''
    description: string
    MOTstatus: MOTStatus
    MOTdate: string
    TAXstatus: TAXStatus
    TAXdate: string
}) {
    // Validate that a userId is present.
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    // Format dates to YYYY-MM-DD
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
    }

    // Format both dates
    const formattedMOTDate = formatDate(MOTdate)
    const formattedTAXDate = formatDate(TAXdate)

    // Update the vehicle
    try {
        const companyVehicle = await db.companyVehicles.updateMany({
            where: { registration },
            data: {
                registration,
                company,
                description,
                MOTstatus,
                MOTdate: formattedMOTDate,
                TAXstatus,
                TAXdate: formattedTAXDate,
            },
        })
        return companyVehicle
    } catch (error) {
        console.error('Error:', error)
        throw error // Re-throw the error to handle it in the calling function
    }
}
