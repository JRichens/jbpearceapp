'use client'

import { useEffect, useMemo, useState } from 'react'

import { Event } from '@prisma/client'

import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { GetEvents } from '@/actions/events-data/events'
import { Card } from '@/components/ui/card'

const Events = () => {
    const [newEventOpen, setNewEventOpen] = useState(false)
    const [eventsData, setEventsData] = useState<Event[]>([])
    const [gettingEvents, setGettingEvents] = useState(false)

    // Get Events
    useEffect(() => {
        const getEvents = async () => {
            try {
                setGettingEvents(true)
                const events = await GetEvents()
                events && setEventsData(events)
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setGettingEvents(false)
            }
        }

        getEvents()
    }, [])

    const columns = useMemo<MRT_ColumnDef<Event>[]>(
        () => [
            {
                header: 'Type',
                accessorKey: 'type',
                size: 30,
            },
            {
                header: 'Name',
                accessorKey: 'name',
                size: 30,
            },
            {
                header: 'Date',
                accessorKey: 'date',
                size: 30,
            },
            {
                header: 'Event',
                size: 30,
                Cell: ({ cell, row }) => (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                console.log(row)
                            }}
                        >
                            View
                        </Button>
                    </div>
                ),
            },
        ],
        [] // Remove eventsData as it's not used in the memoized value
    )

    return (
        <Card className="w-full">
            <Button onClick={() => setNewEventOpen(true)} className="m-4 w-fit">
                <Plus className="mr-2 h-4 w-4" />
                New
            </Button>
            {eventsData && (
                <MaterialReactTable
                    columns={columns}
                    data={eventsData}
                    initialState={{
                        density: 'compact',
                        pagination: { pageIndex: 0, pageSize: 100 },
                    }}
                />
            )}
        </Card>
    )
}

export default Events
