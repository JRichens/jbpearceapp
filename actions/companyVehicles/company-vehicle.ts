'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { CompanyVehicles, MOTStatus, TAXStatus } from '@prisma/client'
import { isValid, parse, isBefore } from 'date-fns'

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
                MOTstatus: 'Valid',
                MOTdate: 'No date',
                MOTdays: 0,
                TAXstatus: 'Taxed',
                TAXdate: 'No date',
                TAXdays: 0,
            },
        })
        return companyVehicle
    } catch (error) {
        console.error('Error', error)
    }
}

const DEBUG_MODE = false // Toggle this to true/false to enable/disable logging
// Create a debug logger utility
const debugLog = {
    group: (...args: any[]) => DEBUG_MODE && console.group(...args),
    groupEnd: () => DEBUG_MODE && console.groupEnd(),
    log: (...args: any[]) => DEBUG_MODE && console.log(...args),
    error: (...args: any[]) => DEBUG_MODE && console.error(...args),
    warn: (...args: any[]) => DEBUG_MODE && console.warn(...args),
    table: (...args: any[]) => DEBUG_MODE && console.table(...args),
    time: (...args: any[]) => DEBUG_MODE && console.time(...args),
    timeEnd: (...args: any[]) => DEBUG_MODE && console.timeEnd(...args),
}
export async function GetAllCompanyVehicles() {
    debugLog.group('🚗 Vehicle Processing Summary')
    console.time('Total Execution Time')

    const { userId }: { userId: string | null } = auth()
    if (!userId) {
        debugLog.error('❌ Authentication Error: User not authenticated')
        debugLog.groupEnd()
        throw new Error('User must be authenticated.')
    }

    try {
        const companyVehicles = await db.companyVehicles.findMany()

        // Early return if no vehicles
        if (!companyVehicles || companyVehicles.length === 0) {
            debugLog.warn('⚠️ No vehicles found in database')
            debugLog.groupEnd()
            return []
        }

        // Initialize result collectors
        const results = {
            success: [] as any[],
            motIgnored: [] as any[],
            taxIgnored: [] as any[],
            sornVehicles: [] as any[],
            untaxedVehicles: [] as any[],
            errors: [] as any[],
            apiErrors: [] as any[],
        }

        const vehiclesWithTaxDates = await Promise.all(
            companyVehicles.map(async (vehicle: CompanyVehicles) => {
                if (!vehicle || !vehicle.registration) {
                    results.errors.push({
                        registration: vehicle?.registration || 'UNKNOWN',
                        error: 'Invalid vehicle data',
                    })
                    return null
                }

                // Handle TRADE PLATES
                if (vehicle.registration.toUpperCase().includes('TRADE')) {
                    const TAXdays = Math.round(
                        (new Date(vehicle.TAXdate).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                    )
                    const TAXstatus = TAXdays > 0 ? 'Taxed' : 'Untaxed'
                    results.success.push({
                        registration: vehicle.registration,
                        company: vehicle.company,
                    })
                    // We still need to calculate tax days, but no MOT
                    await db.companyVehicles.update({
                        where: { id: vehicle.id },
                        data: {
                            MOTstatus: 'NA',
                            MOTdate: 'No date',
                            MOTdays: 0,
                            TAXstatus,
                            TAXdays,
                        },
                    })
                }

                // Handle MOT Ignores and NA
                if (
                    vehicle.MOTstatus === 'Agri' ||
                    vehicle.MOTstatus === 'NA'
                ) {
                    results.motIgnored.push({
                        registration: vehicle.registration,
                        company: vehicle.company,
                    })
                    await db.companyVehicles.update({
                        where: { id: vehicle.id },
                        data: {
                            MOTdate: 'No date',
                            MOTdays: 0,
                        },
                    })
                }

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
                        results.apiErrors.push({
                            registration: vehicle.registration,
                            status: response.status,
                            statusText: response.statusText,
                        })
                        return vehicle
                    }

                    const data = await response.json()

                    // Process MOT Status
                    if (
                        vehicle.MOTstatus !== 'Agri' &&
                        vehicle.MOTstatus !== 'NA'
                    ) {
                        if (
                            data.motExpiryDate ||
                            vehicle.MOTdate !== 'No date'
                        ) {
                            const motDate = data.motExpiryDate
                                ? new Date(data.motExpiryDate)
                                : new Date(vehicle.MOTdate)
                            const MOTdays = Math.round(
                                (motDate.getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                            )
                            await db.companyVehicles.update({
                                where: { id: vehicle.id },
                                data: {
                                    MOTstatus:
                                        MOTdays > 0 ? 'Valid' : 'Expired',
                                    MOTdate: motDate
                                        .toISOString()
                                        .split('T')[0],
                                    MOTdays: MOTdays,
                                },
                            })
                        }
                    }

                    // Process Tax Status
                    if (data.taxStatus === 'SORN') {
                        results.sornVehicles.push({
                            registration: vehicle.registration,
                            company: vehicle.company,
                        })
                        return await db.companyVehicles.update({
                            where: { id: vehicle.id },
                            data: {
                                TAXstatus: 'SORN',
                                TAXdate: 'No date',
                                TAXdays: 0,
                            },
                        })
                    }

                    if (data.taxStatus === 'Untaxed') {
                        results.untaxedVehicles.push({
                            registration: vehicle.registration,
                            company: vehicle.company,
                        })
                        const updateData: Record<string, any> = {
                            TAXstatus: 'Untaxed',
                            TAXdays: 0,
                        }
                        if (!vehicle.TAXdate) {
                            updateData.TAXdate = 'No date'
                        }
                        return await db.companyVehicles.update({
                            where: { id: vehicle.id },
                            data: updateData,
                        })
                    }

                    if (data.taxStatus === 'Taxed') {
                        // Check if the existing TAXdate is later than the API's taxDueDate
                        const existingTaxDate =
                            vehicle.TAXdate !== 'No date'
                                ? new Date(vehicle.TAXdate)
                                : null
                        const apiTaxDate = new Date(data.taxDueDate)

                        // Only use API date if there's no existing date or if API date is later
                        const finalTaxDate =
                            existingTaxDate &&
                            !isBefore(existingTaxDate, apiTaxDate)
                                ? existingTaxDate
                                : apiTaxDate

                        const taxDays = Math.round(
                            (finalTaxDate.getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24)
                        )

                        results.success.push({
                            registration: vehicle.registration,
                            company: vehicle.company,
                            taxDueDate: finalTaxDate
                                .toISOString()
                                .split('T')[0],
                            taxDays,
                            motExpiryDate: data.motExpiryDate,
                        })

                        return await db.companyVehicles.update({
                            where: { id: vehicle.id },
                            data: {
                                TAXstatus: 'Taxed',
                                TAXdate: finalTaxDate
                                    .toISOString()
                                    .split('T')[0],
                                TAXdays: taxDays,
                            },
                        })
                    }

                    return vehicle
                } catch (error: unknown) {
                    results.errors.push({
                        registration: vehicle.registration,
                        error: (error as Error).message,
                    })
                    return vehicle
                }
            })
        )

        // Log Results Summary
        debugLog.group('📊 Processing Results Summary')

        if (results.success.length > 0) {
            debugLog.log('✅ Successfully Processed Vehicles:')
            debugLog.table(results.success)
        }

        if (results.motIgnored.length > 0) {
            debugLog.log('ℹ️ MOT Ignored Vehicles:')
            debugLog.table(results.motIgnored)
        }

        if (results.taxIgnored.length > 0) {
            debugLog.log('ℹ️ Tax Ignored Vehicles:')
            debugLog.table(results.taxIgnored)
        }

        if (results.sornVehicles.length > 0) {
            debugLog.log('🚫 SORN Vehicles:')
            debugLog.table(results.sornVehicles)
        }

        if (results.untaxedVehicles.length > 0) {
            debugLog.log('🚫 Untaxed Vehicles:')
            debugLog.table(results.untaxedVehicles)
        }

        if (results.apiErrors.length > 0) {
            debugLog.log('⚠️ API Errors:')
            debugLog.table(results.apiErrors)
        }

        if (results.errors.length > 0) {
            debugLog.log('❌ Processing Errors:')
            debugLog.table(results.errors)
        }

        debugLog.groupEnd()

        // Final Statistics
        debugLog.log('📈 Final Statistics:', {
            totalVehicles: companyVehicles.length,
            successfullyProcessed: results.success.length,
            motIgnored: results.motIgnored.length,
            taxIgnored: results.taxIgnored.length,
            sornVehicles: results.sornVehicles.length,
            untaxedVehicles: results.untaxedVehicles.length,
            errors: results.errors.length + results.apiErrors.length,
        })

        console.timeEnd('Total Execution Time')
        debugLog.groupEnd()

        const validVehicles = vehiclesWithTaxDates.filter(
            (vehicle): vehicle is CompanyVehicles => vehicle !== null
        )
        return validVehicles
    } catch (error) {
        debugLog.error('❌ Fatal Error:', error)
        console.timeEnd('Total Execution Time')
        debugLog.groupEnd()
        throw error
    }
}

const COMPANY_OPTIONS = ['J B Pearce', 'JBP Ltd', 'Farm', 'Gradeacre'] as const
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

    // Helper function to validate and format date
    const validateAndFormatDate = (dateString: string): string | null => {
        // Parse the date string (assuming format YYYY-MM-DD)
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date())

        // Check if the date is valid
        if (!isValid(parsedDate)) {
            return null
        }

        // Return formatted date string
        return parsedDate.toISOString().split('T')[0]
    }

    // Calculate days remaining for a date
    const calculateDaysRemaining = (dateString: string): number => {
        if (dateString === 'No date') return 0
        const date = new Date(dateString)
        return Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }

    // Validate dates
    const validMOTDate = validateAndFormatDate(MOTdate)
    const validTAXDate = validateAndFormatDate(TAXdate)

    // Calculate days remaining
    const MOTdays = validMOTDate ? calculateDaysRemaining(validMOTDate) : 0
    const TAXdays = validTAXDate ? calculateDaysRemaining(validTAXDate) : 0

    // Prepare update data
    const updateData: Record<string, any> = {
        registration,
        company,
        description,
        MOTstatus,
        TAXstatus,
        MOTdays,
        TAXdays,
    }

    // Only include valid dates in the update
    if (validMOTDate) {
        updateData.MOTdate = validMOTDate
    }
    if (validTAXDate) {
        updateData.TAXdate = validTAXDate
    }

    // Update the vehicle
    try {
        // Find the vehicle first
        const existingVehicle = await db.companyVehicles.findFirst({
            where: { registration },
        })

        if (!existingVehicle) {
            throw new Error('Vehicle not found')
        }

        // Update the vehicle using update instead of updateMany
        const companyVehicle = await db.companyVehicles.update({
            where: { id: existingVehicle.id },
            data: updateData,
        })
        return companyVehicle
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export async function DeleteCompanyVehicle(registration: string) {
    try {
        const deletedVehicle = await db.companyVehicles.deleteMany({
            where: { registration },
        })
        return deletedVehicle
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}
