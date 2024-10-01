'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GetEvents() {
    // Validate that a userId is present.
    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        throw new Error('User must be authenticated.')
    }

    // Fetch the discount data from the database.
    try {
        const events = await db.event.findMany()
        return events
    } catch (error) {
        console.error('Error fetching discounts:', error)
        throw error
    }
}
