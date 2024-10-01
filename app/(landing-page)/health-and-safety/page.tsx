import { GetTasks } from '@/actions/get-tasks'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { columns } from './check-components/columns'
import { DataTable } from './check-components/data-table'
import { ScrollPopup } from './check-components/scroll-popup'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Events from './event-components/page'

const convertStringToDate = (givenDate: string) => {
    let [dayName, day, monthName, year, time] = givenDate.split(' ')

    const monthMap: { [key: string]: string } = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12',
    }

    // Split the time into hours and minutes
    let [hours, minutes] = time.split(':')

    // Replace the month name with its corresponding numeric value
    monthName = monthMap[monthName as keyof typeof monthMap]

    // Create a new Date object with time
    let date = new Date(
        Number(year),
        Number(monthName) - 1,
        Number(day),
        Number(hours),
        Number(minutes)
    )
    return date
}

const HealthAndSafety = async () => {
    const tasks = await GetTasks()
    // the tasks need to be sorted by the checkDate which is formatted Fri 5 Jan 2024
    tasks!.sort((a, b) => {
        return (
            convertStringToDate(b.checkDate!).getTime() -
            convertStringToDate(a.checkDate!).getTime()
        )
    })

    const data = tasks || []
    return (
        <>
            <ScrollPopup />
            <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
                <CardHeader>
                    <CardTitle>Health &amp; Safety</CardTitle>
                    <CardDescription>
                        All information regarding site health and safety
                    </CardDescription>
                </CardHeader>

                <div className="px-4 md:px-6 pb-3">
                    <Tabs defaultValue="checks" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger className="w-full" value="checks">
                                Daily Site Checks
                            </TabsTrigger>
                            <TabsTrigger className="w-full" value="events">
                                Events Logs
                            </TabsTrigger>
                            <TabsTrigger className="w-full" value="rams">
                                Risk Assessments
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="checks">
                            <ScrollArea className="">
                                <DataTable columns={columns} data={data} />
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="events">
                            <ScrollArea className="">
                                <Events />
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="rams">
                            Change your password here.
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>
        </>
    )
}

export default HealthAndSafety
