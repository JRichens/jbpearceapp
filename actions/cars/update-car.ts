'use server'

import { db } from '@/lib/db'

export async function updateCar(reg: string, data: { paintCode?: string }) {
    try {
        const car = await db.car.update({
            where: {
                reg: reg,
            },
            data: {
                ...data,
            },
        })

        return car
    } catch (error) {
        console.log('[UPDATE_CAR]', error)
        throw new Error('Failed to update car')
    }
}
