'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'

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

    // Get the vehicle Tax date
    let taxDueDate = null
    try {
        const response = await fetch(
            'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
            {
                method: 'POST',
                headers: {
                    'x-api-key': 'lF3zjCub9ZBABWYWNGES7aPt0QVMEYYaGI4LgjFi',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ registrationNumber: reg }),
            }
        )

        if (!response.ok) {
            throw new Error(
                `Error fetching vehicle data for ${reg}: ${response.statusText}`
            )
        }

        const data = await response.json()
        console.log(data)
        taxDueDate = data.taxDueDate // Extract the tax due date from the response
    } catch (error) {
        console.error('Error fetching vehicle tax date:', error)
        throw error // Re-throw the error after logging
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
    // Validate that a userId is present.
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    // Update the user in the database
    try {
        const companyVehicles = await db.companyVehicles.findMany()
        // Get the tax date for each vehicle
        for (const vehicle of companyVehicles) {
            const response = await fetch(
                'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
                {
                    method: 'POST',
                    headers: {
                        'x-api-key': 'lF3zjCub9ZBABWYWNGES7aPt0QVMEYYaGI4LgjFi',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registrationNumber: vehicle.registration,
                    }),
                }
            )
            if (!response.ok) {
                console.log(
                    `Error fetching vehicle data: ${response.statusText}`
                )
            } else {
                const data = await response.json()
                console.log(
                    `Tax due date for ${vehicle.registration}: ${data.taxDueDate}`
                )
            }

            const data = await response.json()
        }
        return companyVehicles
    } catch (error) {
        console.error('Error', error)
    }
}
