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

    // Update the user in the database
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
        return companyVehicles
    } catch (error) {
        console.error('Error', error)
    }
}
