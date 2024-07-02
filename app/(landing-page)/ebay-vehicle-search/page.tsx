'use client'

import { useEffect, useState } from 'react'

import { Car } from '@prisma/client'

import {
    WebScrape,
    WebScrapeCountListings,
    WebScrapeAnalyseItems,
    WebScrapeIndividualItems,
} from '@/actions/webscrape'

import Typewriter from 'typewriter-effect'

import { format, parseISO } from 'date-fns'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Form } from '../_components/reg-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Bot, Brain, Lightbulb, Loader2 } from 'lucide-react'
import { ThreeCircles } from 'react-loader-spinner'

function calculatePercentile(arr: number[], percentile: number): number {
    const sorted = arr.slice().sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper === lower) return sorted[index]
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function roundToNearest5(value: number): number {
    return Math.round(value / 5) * 5
}

// Helper function to calculate months difference
function calculateMonthsDifference(dateFrom: Date, dateTo: Date): number {
    const yearsDifference = dateTo.getFullYear() - dateFrom.getFullYear()
    const monthsDifference = dateTo.getMonth() - dateFrom.getMonth()
    return yearsDifference * 12 + monthsDifference + 1 // Add 1 to include both start and end months
}

function processData(input: InputItem[]): OutputItem[] {
    return input
        .filter((item) => item.data.length > 0)
        .map((item) => {
            const dates = item.data.map((d) => new Date(d.soldDate))
            const prices = item.data.map((d) =>
                parseFloat(d.soldPrice.replace(/[£,]/g, ''))
            )

            const dateFrom = new Date(
                Math.min(...dates.map((d) => d.getTime()))
            )
            const dateTo = new Date(Math.max(...dates.map((d) => d.getTime())))

            // Calculate average sales per month
            const monthsDifference = calculateMonthsDifference(dateFrom, dateTo)
            const averageSalesPerMonth =
                monthsDifference > 0
                    ? item.data.length / monthsDifference
                    : item.data.length // If less than a month, return total sales

            return {
                itemName: item.itemName,
                dateFrom: dateFrom.toISOString().split('T')[0],
                dateTo: dateTo.toISOString().split('T')[0],
                priceFrom: roundToNearest5(calculatePercentile(prices, 20)),
                priceTo: roundToNearest5(calculatePercentile(prices, 80)),
                count: item.data.length,
                monthly: Math.round(averageSalesPerMonth),
            }
        })
}

interface InputItem {
    itemName: string
    data: {
        title: string
        soldPrice: string
        soldDate: string
    }[]
}
interface OutputItem {
    itemName: string
    dateFrom: string
    dateTo: string
    priceFrom: number
    priceTo: number
    count: number
    monthly: number
}
type AIeBayItem = {
    item: string
    avg_price: string
    frequency: string
    count: number
}
type AIeBayResponse = {
    date_span: string
    items: AIeBayItem[]
}

const EbayVehicleSearch = () => {
    const [vehicle, setVehicle] = useState<Car | null>(null)
    const [searchInput, setSearchInput] = useState('')
    const [addressInput, setAddressInput] = useState('')
    const [scraping, setScraping] = useState(false)
    const [scrapedAnalysis, setScrapedAnalysis] = useState('')
    const [listCounting, setListCounting] = useState(false)
    const [carScraping, setCarScraping] = useState(false)
    const [carScrapedAnalysis, setCarScrapedAnalysis] = useState('')
    const [carScrappeAccumulation, setCarScrappeAccumulation] = useState('')
    const [carTableBuilding, setCarTableBuilding] = useState(false)
    const [carScrappedObject, setcarScrappedObject] =
        useState<AIeBayResponse | null>(null)
    const [numberOfListings, setNumberOfListings] = useState('')
    const [deepScraping, setDeepScraping] = useState(false)
    const [deepScrappedObject, setdeepScrappedObject] = useState<OutputItem[]>(
        []
    )
    const [currentTab, setCurrentTab] = useState('aiscrape')

    useEffect(() => {
        if (carScrappeAccumulation) {
            try {
                const parsedData = JSON.parse(carScrappeAccumulation)
                setcarScrappedObject(parsedData)
                setCarScrappeAccumulation('') // Clear the accumulator
                setCarTableBuilding(false)
                setCurrentTab('aiscrape')
            } catch (error) {
                // If parsing fails, it means we don't have the complete JSON yet
                console.log('Accumulating JSON data...')
            }
        }
    }, [carScrappeAccumulation])

    useEffect(() => {
        // when vehicle changes, reset carScrapedAnalysis
        setCarScrapedAnalysis('')
        setcarScrappedObject(null)
        setNumberOfListings('')

        if (vehicle) {
            const newSearchInput = `${vehicle.dvlaMake} ${
                vehicle.dvlaModel?.split(' ')[0]
            } ${vehicle.modelSeries?.split(' ')[0]}`
            setSearchInput(newSearchInput)

            const fetchData = async () => {
                try {
                    const url = `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${newSearchInput}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`

                    setListCounting(true)
                    const numberOfListings = await WebScrapeCountListings(url)
                    if (numberOfListings) {
                        setNumberOfListings(numberOfListings)
                    }
                } catch (error) {
                    console.error('Error fetching data:', error)
                } finally {
                    setListCounting(false)
                }
            }

            fetchData()
        }
    }, [vehicle])

    const openEbayUrl = () => {
        //https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=FORD%20KUGA%20MK1%202009&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40
        const url = `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`
        window.open(url, '_blank')
    }

    const carAnalysis = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // Clear previous results
        setCarScrapedAnalysis('')
        setcarScrappedObject(null)
        // Create the URL to pass to the server action
        const url = `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`

        setCarScraping(true)
        const numberOfListings = await WebScrapeCountListings(url)

        numberOfListings &&
            setNumberOfListings(
                numberOfListings + ' listings processing for AI, please wait...'
            )

        const scrapedData = await WebScrapeAnalyseItems(
            url,
            numberOfListings ? numberOfListings : '0',
            searchInput
        )

        // // Console log first item of the array of objects
        // console.log('First item of the array of objects: ', scrapedData[0])
        // // Console log last item of the array of objects
        // console.log(
        //     'Last item of the array of objects: ',
        //     scrapedData[scrapedData.length - 1]
        // )

        // console.log('Total number of listings: ', scrapedData.length)

        // console.log('All items of the array of objects: ', scrapedData)

        // Then call the AI Streaming API
        const response = await fetch('/api/anthropic-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: scrapedData,
                vehicleSearchTerm: searchInput,
                totalItems: scrapedData.length,
            }),
        })
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let done = false

        setCarScraping(false)
        setCarTableBuilding(true)

        while (!done) {
            const { value, done: readerDone } = await reader?.read()!
            done = readerDone
            const newData = decoder.decode(value)
            setCarScrappeAccumulation((prev) => prev + newData)
        }
    }

    const deepAnalysis = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeepScraping(true)
        const deepScrapedData = await WebScrapeIndividualItems(searchInput)

        console.log('deepScrapedData: ', deepScrapedData)
        let totalItems = 0

        for (let i = 0; i < deepScrapedData.length; i++) {
            totalItems += deepScrapedData[i].data.length
        }
        console.log('total deep items', totalItems)

        // Create an object with the data
        const processedData = processData(deepScrapedData)
        setdeepScrappedObject(processedData)
        setCurrentTab('deepscrape')
        setDeepScraping(false)
    }

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // First check if valid url entered
        if (!addressInput) {
            return
        }
        setScraping(true)
        const analysis = await WebScrape(addressInput)
        console.log(analysis)
        // @ts-ignore
        setScrapedAnalysis(analysis.content[0].text)
        setScraping(false)
    }

    return (
        <>
            <div className="max-w-3xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
                <h1 className="font-bold text-2xl">eBay Vehicle Search</h1>
                <p>
                    Search for parts & accessories related to your vehicle by
                    value
                </p>
                <Separator className="mt-2 mb-6" />
                <Form setVehicle={setVehicle} />
                {vehicle?.vinOriginalDvla && (
                    <div className="mt-4">
                        <span>
                            {vehicle.dvlaMake} / {vehicle.dvlaModel} /{' '}
                            {vehicle.dvlaYearOfManufacture} /{' '}
                            {vehicle.modelSeries}
                        </span>

                        <p>
                            <strong>Reg:</strong> {vehicle.reg}
                        </p>

                        <div className="flex flex-row gap-1">
                            <strong>Listings:</strong>{' '}
                            {listCounting ? (
                                <Loader2 className="h-4 w-4 animate-spin mt-1" />
                            ) : (
                                numberOfListings.split(' ')[0]
                            )}
                        </div>

                        <p className="pt-3 pb-1">
                            <strong>Search</strong> - Change &amp; analyse again
                            if needed
                        </p>
                        <div className="flex flex-row gap-1 items-center pb-2">
                            <Lightbulb className="h-5 w-5" /> Tip! - Try using
                            year instead of MK
                        </div>
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <div className="flex flex-row gap-4 mt-2 items-center">
                            <Button onClick={openEbayUrl} className="">
                                Open on eBay
                            </Button>
                            <Button
                                disabled={listCounting}
                                onClick={carAnalysis}
                                className="w-36"
                            >
                                {carScraping ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Bot className="mr-2 h-5 w-5" />
                                        AI Analysis
                                    </>
                                )}
                            </Button>
                            <Button
                                disabled={listCounting}
                                onClick={deepAnalysis}
                                className="w-36"
                            >
                                {deepScraping ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Brain className="mr-2 h-5 w-5" />
                                        Deep Scrape
                                    </>
                                )}
                            </Button>
                            <div className="flex flex-row gap-2 items-center">
                                <AlertTriangle className="h-10 w-10" /> Takes up
                                to 2 mins!
                            </div>
                        </div>
                    </div>
                )}
                <div className="pt-3"></div>
                {/* Render the HTML passed from the server action */}
                {vehicle && (
                    <Tabs
                        defaultValue="aiscrape"
                        className="w-full"
                        onValueChange={setCurrentTab}
                        value={currentTab}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="aiscrape">
                                AI Scrape
                            </TabsTrigger>
                            <TabsTrigger value="deepscrape">
                                Deep Scrape
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="aiscrape">
                            {carTableBuilding && (
                                <div className="w-full flex flex-col items-center pt-4">
                                    <Typewriter
                                        onInit={(typewriter) => {
                                            typewriter
                                                .typeString(
                                                    `Building table of analysis..`
                                                )
                                                .pauseFor(3000)
                                                .deleteAll()
                                                .typeString(`Please wait..`)
                                                .pauseFor(30000)
                                                .start()
                                        }}
                                    />
                                    <div className="w-full flex flex-col items-center pt-3">
                                        <ThreeCircles color="#d3c22a" />
                                    </div>
                                </div>
                            )}
                            {carScrappedObject && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>
                                                    Average Price
                                                </TableHead>
                                                <TableHead>Frequency</TableHead>
                                                <TableHead>Count</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {carScrappedObject.items
                                                .sort(
                                                    (a, b) => b.count - a.count
                                                )
                                                .map((item, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className=""
                                                    >
                                                        <TableCell className="font-medium py-0">
                                                            <Button
                                                                variant={
                                                                    'secondary'
                                                                }
                                                                className="m-w"
                                                                onClick={() => {
                                                                    // Open another browser window linking to the item
                                                                    // https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput} ${item.item}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40
                                                                    window.open(
                                                                        `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput} ${item.item}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`,
                                                                        '_blank'
                                                                    )
                                                                }}
                                                            >
                                                                {item.item}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.avg_price}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.frequency}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                item.frequency ===
                                                                'Very High'
                                                                    ? 'font-semibold'
                                                                    : ''
                                                            }
                                                        >
                                                            {item.count}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="deepscrape">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="w-48">
                                                Dates
                                            </TableHead>
                                            <TableHead>Price Range</TableHead>
                                            <TableHead>Count</TableHead>
                                            <TableHead>Monthly</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deepScrappedObject
                                            .sort(
                                                (a, b) => b.monthly - a.monthly
                                            )
                                            .map((item, index) => (
                                                <TableRow
                                                    key={index}
                                                    className=""
                                                >
                                                    <TableCell className="font-medium py-0">
                                                        <Button
                                                            variant={
                                                                'secondary'
                                                            }
                                                            className="m-w"
                                                            onClick={() => {
                                                                // Open another browser window linking to the item
                                                                // https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput} ${item.item}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40
                                                                window.open(
                                                                    `https://www.ebay.co.uk/sch/131090/i.html?_from=R0&_nkw=${searchInput} ${item.itemName}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`,
                                                                    '_blank'
                                                                )
                                                            }}
                                                        >
                                                            {item.itemName}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(
                                                            parseISO(
                                                                item.dateFrom
                                                            ),
                                                            'd MMM yy'
                                                        )}
                                                        {' - '}
                                                        {format(
                                                            parseISO(
                                                                item.dateTo
                                                            ),
                                                            'd MMM yy'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        £{item.priceFrom}
                                                        {' - '}
                                                        {item.priceTo}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.count}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.monthly}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
            {carScraping && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
                    <div className="w-full flex flex-col">
                        <div>
                            Scraping {numberOfListings.split(' ')[0]} listings..
                        </div>
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter
                                    .typeString(`Scraping eBay page 1..`)
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 2..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 3..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 4..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 5..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 6..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 7..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 8..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 9..')
                                    .pauseFor(1750)
                                    .deleteChars(9)
                                    .typeString(' page 10..')
                                    .pauseFor(30000)
                                    .start()
                            }}
                        />
                        <div className="w-full flex flex-col items-center pt-3">
                            <ThreeCircles color="#d3c22a" />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default EbayVehicleSearch
