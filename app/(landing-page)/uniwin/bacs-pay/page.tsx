'use client'

import { useEffect, useState, useTransition } from 'react'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { UnPaidTickets } from '@/types/uniwindata'
import { createColumns } from './_components/columns'
import { DataTable } from './_components/data-table'
import { NavMenu } from '../nav-menu'
import { Separator } from '@/components/ui/separator'
import { ThreeCircles } from 'react-loader-spinner'

import * as React from 'react'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarDays, DownloadIcon, PrinterIcon } from 'lucide-react'
import ReactToPrint from 'react-to-print'
import { DataTablePrint } from './_components/print-data-table'
import { Input } from '@/components/ui/input'
import { GetUser } from '@/actions/get-user'
import { DialogInitials } from './_components/dialog-initials'

const ReconcileBank = () => {
    class ComponentToPrint extends React.Component {
        render() {
            return (
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <div className="px-2 flex items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
                            <span>
                                From:{' '}
                                {date?.from && format(date.from, 'dd/MM/yyyy')}
                            </span>
                            <span>
                                To: {date?.to && format(date.to, 'dd/MM/yyyy')}
                            </span>
                        </div>
                        <div className="px-2 flex items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
                            Total Payable: {totalPayable}
                        </div>
                    </div>

                    <DataTablePrint
                        columns={createColumns(() => {}, false, false).filter(
                            (col) =>
                                (col as { accessorKey?: string })
                                    .accessorKey !== 'logical22'
                        )}
                        data={unPaidTickets}
                    />
                </div>
            )
        }
    }

    const [unPaidTickets, setUnPaidTickets] = useState<UnPaidTickets[]>([])
    const [totalPayable, setTotalPayable] = useState('')
    const [isPending, startTransition] = useTransition()
    const [initials, setInitials] = useState('')
    const [initialsDialog, setInitialsDialog] = useState(false)
    const [bulkChecked, setBulkChecked] = useState(false)
    const [isBulkUpdating, setIsBulkUpdating] = useState(false)

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    const formatSortCode = (sortCode: string): string => {
        return sortCode.replace(/\D/g, '').slice(0, 6)
    }

    useEffect(() => {
        const getTickets = async () => {
            startTransition(async () => {
                const from =
                    date?.from &&
                    Math.floor(
                        (date.from.getTime() -
                            new Date(1899, 11, 30).getTime()) /
                            86400000
                    )
                const to =
                    date?.to &&
                    Math.floor(
                        (date.to.getTime() - new Date(1899, 11, 30).getTime()) /
                            86400000
                    )

                try {
                    const res = await fetch(
                        'https://genuine-calf-newly.ngrok-free.app/unPaidTickets?from=' +
                            from +
                            '&to=' +
                            to,
                        {
                            method: 'GET',
                            headers: {
                                'ngrok-skip-browser-warning': '69420',
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    const data = await res.json()

                    // Clean and validate the data before setting state
                    const cleanedData = data.map((ticket: UnPaidTickets) => ({
                        ...ticket,
                        string8: formatSortCode(ticket.string8), // string8 is the sort code
                    }))
                    setUnPaidTickets(cleanedData)
                } catch (error) {}

                try {
                    const res = await fetch(
                        'https://genuine-calf-newly.ngrok-free.app/unPaidTickets?from=' +
                            from +
                            '&to=' +
                            to +
                            '&total=true',
                        {
                            method: 'GET',
                            headers: {
                                'ngrok-skip-browser-warning': '69420',
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    const total = await res.json()
                    // Format the total to a monetary value in GBP pounds
                    const formatter = new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: 'GBP',
                    })

                    const totalFormatted = formatter.format(total)

                    setTotalPayable(totalFormatted)
                } catch (error) {}
            })
        }
        getTickets()
    }, [date])

    useEffect(() => {
        const getInitials = async () => {
            const user = await GetUser()
            user?.initials && setInitials(user.initials)
            if (!user?.initials) {
                setInitialsDialog(true)
            }
        }
        getInitials()
    }, [])

    const downloadCsv = (data: any[]) => {
        // Define the new headers in the desired order
        const newHeaders = [
            'Suppliers Name',
            'Ticket No',
            'Payable',
            'Payment',
            'On Hold',
            'Paid By',
            'Ticket Date',
            'Account No',
            'Sort Code',
            'Telephone No',
            'Date',
            'Remarks',
        ]

        // Today's date in the required format
        const todayDate = new Date().toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })

        // Today's date but YYYY-MM-DD
        const todayDateYYYYMMDD = new Date().toISOString().slice(0, 10)

        // Map each object to the new CSV row structure
        const rows = data
            .map((obj) =>
                [
                    `"${obj.string9}"`, // Suppliers Name
                    `"${obj.ticket2}"`, // Ticket No
                    `"${obj.number6}"`, // Payable - assuming `number2` is the correct field, added default empty if not present
                    `"Awaiting"`, // Payment
                    `"No"`, // On Hold
                    `""`, // Paid By
                    `"${obj.number17}"`, // Ticket Date
                    `"${obj.string7}"`, // Account No
                    `"${obj.string8}"`, // Sort Code
                    `""`, // Telephone No
                    `"${todayDate}"`, // Date - hardcoded as example, can use todayDate for dynamic date
                    `""`, // Remarks
                ].join(',')
            )
            .join('\n')

        const csvString = newHeaders.join(',') + '\n' + rows
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        // Create download link and trigger download
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `${todayDateYYYYMMDD}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const componentRef = React.useRef<ComponentToPrint | null>(null)

    const handleBulkPaidChange = async (checked: boolean) => {
        setIsBulkUpdating(true)
        setBulkChecked(checked)

        // Convert current date to Excel date format
        const today = Math.floor(
            (new Date().getTime() - new Date(1899, 11, 30).getTime()) / 86400000
        ).toString()

        const user = await GetUser()

        try {
            // Update all visible tickets
            const updatePromises = unPaidTickets.map((ticket) =>
                fetch(
                    `https://genuine-calf-newly.ngrok-free.app/unPaidTickets?ticketNo=${
                        ticket.ticket2
                    }&paid=${checked ? 1 : 0}&initials=${
                        user?.initials
                    }&date=${today}&bank=BACS`,
                    {
                        method: 'PUT',
                        headers: {
                            'ngrok-skip-browser-warning': '69420',
                            'Content-Type': 'application/json',
                        },
                    }
                )
            )

            await Promise.all(updatePromises)
            console.log('Bulk update completed successfully')
        } catch (error) {
            console.error('Failed to complete bulk update:', error)
            setBulkChecked(false)
        } finally {
            setIsBulkUpdating(false)
        }
    }

    const columns = createColumns(
        handleBulkPaidChange,
        bulkChecked,
        isBulkUpdating
    )

    return (
        <>
            <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
                <div className="pl-2">
                    <NavMenu />
                </div>

                <Separator />
                <CardHeader>
                    <CardTitle>BACS Pay</CardTitle>
                    <CardDescription>
                        Print out what needs to be paid. Then export the CSV
                        file for tha bank. Pay it and mark off paid.
                    </CardDescription>
                </CardHeader>

                <div className="px-4 md:px-6 pb-3">
                    <div className="flex flex-row flex-wrap gap-x-2 gap-y-3 pb-2">
                        {/* Date Picker with Range */}
                        <div className={cn('grid gap-2')}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={'outline'}
                                        className={cn(
                                            'justify-start text-left font-normal',
                                            !date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(
                                                        date.from,
                                                        'LLL dd, y'
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        date.to,
                                                        'LLL dd, y'
                                                    )}
                                                </>
                                            ) : (
                                                format(date.from, 'LLL dd, y')
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Print Button */}
                        <div>
                            <ReactToPrint
                                trigger={() => (
                                    <Button variant={'outline'}>
                                        <PrinterIcon className="w-4 h-4 mr-2" />
                                        Print
                                    </Button>
                                )}
                                content={() => componentRef.current}
                                pageStyle={`@page {size: 297mm 210mm; margin: 30;}`}
                            />
                            <div style={{ display: 'none' }}>
                                <ComponentToPrint
                                    ref={(el) => {
                                        if (el) {
                                            componentRef.current = el
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        {/*Export CSV Button */}
                        <div>
                            <Button
                                onClick={() => downloadCsv(unPaidTickets)}
                                variant={'outline'}
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                        {/* Total Payable */}
                        <div className="whitespace-nowrap px-2 flex flex-row items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
                            <span>Total Payable: {totalPayable}</span>
                        </div>
                        {/* Payment Initials */}
                        <div className="relative">
                            <Input
                                className="w-[75px]"
                                placeholder="..."
                                value={initials}
                                readOnly
                            />
                            <div className="absolute bg-white text-sm -top-[10px] left-2">
                                Initials
                            </div>
                        </div>
                        <div className="w-[190px] flex flex-row items-center justify-end">
                            <p className="pt-4">Tick All</p>
                        </div>
                    </div>

                    <ScrollArea className="">
                        {isPending ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <ThreeCircles color="#d3c22a" />
                            </div>
                        ) : (
                            <DataTable columns={columns} data={unPaidTickets} />
                        )}

                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </Card>
            <DialogInitials
                initialsDialog={initialsDialog}
                setInitialsDialog={setInitialsDialog}
                initials={initials}
                setInitials={setInitials}
            />
        </>
    )
}

export default ReconcileBank
