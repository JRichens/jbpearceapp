'use server'

import { db } from '@/lib/db'

export async function GetWeight() {
    try {
        const latestWeightEntry = await db.saveweight.findFirst({})
        if (latestWeightEntry) {
            return latestWeightEntry
        }
    } catch (error) {
        console.error('Failed to fetch latest weight', error)
    }
}
