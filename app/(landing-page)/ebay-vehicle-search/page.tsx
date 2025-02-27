'use client'

import { useEffect, useState } from 'react'
import { Car } from '@prisma/client'
import {
    WebScrape,
    WebScrapeCountListings,
    WebScrapeAnalyseItems,
} from '@/actions/webscrape'
import { askClaude } from '@/actions/claude-ai/askClaude'
import Typewriter from 'typewriter-effect'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form } from '../_components/reg-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Bot, Lightbulb, Loader2 } from 'lucide-react'
import { ThreeCircles } from 'react-loader-spinner'
import { cn } from '@/lib/utils'

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

// Helper function to get badge variant based on frequency
const getFrequencyBadgeStyle = (frequency: string) => {
    switch (frequency.toLowerCase()) {
        case 'very high':
            return 'bg-green-600 hover:bg-green-600/90 text-white'
        case 'high':
            return 'bg-green-400 hover:bg-green-400/90 text-white'
        case 'medium':
            return 'bg-yellow-400 hover:bg-yellow-400/90 text-black'
        case 'low':
            return 'bg-orange-400 hover:bg-orange-400/90 text-white'
        default:
            return 'bg-gray-400 hover:bg-gray-400/90 text-white'
    }
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
    const [progressDescription, setProgressDescription] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [colorClass, setColorClass] = useState('')
    const [elapsedTime, setElapsedTime] = useState(0)

    // Timer effect for scraping process
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (carScraping) {
            // Reset timer when starting a new scrape
            setElapsedTime(0)

            // Set up interval to increment timer every second
            timer = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)
        } else {
            // Reset timer when scraping is done
            setElapsedTime(0)
        }

        // Clean up interval on unmount or when scraping stops
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [carScraping])

    // Format elapsed time as "5s" or "1m 5s"
    const formatElapsedTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}s`
        } else {
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = seconds % 60
            return `${minutes}m ${remainingSeconds}s`
        }
    }

    useEffect(() => {
        if (carScrappeAccumulation) {
            try {
                const parsedData = JSON.parse(carScrappeAccumulation)
                setcarScrappedObject(parsedData)
                setCarScrappeAccumulation('') // Clear the accumulator
                setCarTableBuilding(false)
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

    useEffect(() => {
        const listings = parseInt(
            numberOfListings.split(' ')[0].replace(/,/g, ''),
            10
        )

        if (listings < 100) {
            setProgressDescription('Extremely Unpopular')
            setProgressValue(10)
            setColorClass('bg-red-500')
        } else if (listings < 250) {
            setProgressDescription('Very Unpopular')
            setProgressValue(20)
            setColorClass('bg-red-400')
        } else if (listings < 500) {
            setProgressDescription('Unpopular')
            setProgressValue(35)
            setColorClass('bg-red-300')
        } else if (listings < 1000) {
            setProgressDescription('Reasonably Popular')
            setProgressValue(50)
            setColorClass('bg-green-600')
        } else if (listings < 1500) {
            setProgressDescription('Popular')
            setProgressValue(70)
            setColorClass('bg-green-500')
        } else if (listings < 3000) {
            setProgressDescription('Very Popular')
            setProgressValue(85)
            setColorClass('bg-green-400')
        } else {
            setProgressDescription('Extremely Popular')
            setProgressValue(100)
            setColorClass('bg-green-300')
        }
    }, [numberOfListings])

    const openEbayUrl = () => {
        const url = `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`
        window.open(url, '_blank')
    }

    const carAnalysis = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // Clear previous results
        setCarScrapedAnalysis('')
        setcarScrappedObject(null)
        // Create the URL to pass to the server action
        const url = `https://www.ebay.co.uk/sch/131090/i.html?_from=R20&_nkw=${searchInput}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`

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

        // Limit the number of items to 2000 if there are more
        const limitedData =
            scrapedData.length > 2000 ? scrapedData.slice(0, 2000) : scrapedData

        // Log the data size for debugging
        console.log(
            `Original data size: ${scrapedData.length}, Limited to: ${limitedData.length}`
        )

        // Then call the AI API
        try {
            const response = await askClaude(
                JSON.stringify(limitedData),
                searchInput,
                limitedData.length.toString()
            )

            setCarScraping(false)
            setCarTableBuilding(true)
            setCarScrappeAccumulation(response)
        } catch (error) {
            console.error('Error in carAnalysis:', error)
            setCarScraping(false)
            setCarTableBuilding(false)
        }
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

                        <div className="flex flex-row gap-1 items-center">
                            <strong>Sold Items:</strong>{' '}
                            {listCounting ? (
                                <Loader2 className="h-4 w-4 animate-spin mt-1" />
                            ) : (
                                numberOfListings.split(' ')[0]
                            )}
                            {!listCounting && (
                                <div className="relative">
                                    <Progress
                                        value={progressValue}
                                        className="ml-4 w-[200px]"
                                        color={colorClass}
                                    />
                                    <p
                                        className={cn(
                                            'w-full text-center absolute -top-6',
                                            {
                                                colorClass,
                                            }
                                        )}
                                    >
                                        {progressDescription}
                                    </p>
                                </div>
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
                            className="w-full md:max-w-[375px]"
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
                        </div>
                    </div>
                )}
                <div className="pt-3"></div>
                {/* Render the AI analysis table */}
                {vehicle && (
                    <>
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
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>
                                                    Average Price
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Status
                                                </TableHead>
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
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    'transition-colors',
                                                                    getFrequencyBadgeStyle(
                                                                        item.frequency
                                                                    )
                                                                )}
                                                            >
                                                                {item.frequency}
                                                            </Badge>
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

                                {/* Mobile Cards */}
                                <div className="block md:hidden space-y-4">
                                    {carScrappedObject.items
                                        .sort((a, b) => b.count - a.count)
                                        .map((item, index) => (
                                            <Card
                                                key={index}
                                                className="w-full"
                                            >
                                                <CardHeader className="pb-1 pt-2">
                                                    <CardTitle>
                                                        <Button
                                                            variant={
                                                                'secondary'
                                                            }
                                                            className="w-full text-left h-auto whitespace-normal py-2"
                                                            onClick={() => {
                                                                window.open(
                                                                    `https://www.ebay.co.uk/sch/131090/i.html?_from=R40&_nkw=${searchInput} ${item.item}&_fsrp=1&LH_Complete=1&LH_Sold=1&LH_ItemCondition=4&_ipg=240&rt=nc&_udlo=40`,
                                                                    '_blank'
                                                                )
                                                            }}
                                                        >
                                                            {item.item}
                                                        </Button>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground">
                                                                Price
                                                            </p>
                                                            <p className="font-medium mt-[6px]">
                                                                {item.avg_price}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-muted-foreground">
                                                                Sold
                                                            </p>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'font-medium',
                                                                        {
                                                                            'font-semibold':
                                                                                item.frequency ===
                                                                                'Very High',
                                                                        }
                                                                    )}
                                                                >
                                                                    {item.count}
                                                                </span>
                                                                <Badge
                                                                    className={cn(
                                                                        'transition-colors',
                                                                        getFrequencyBadgeStyle(
                                                                            item.frequency
                                                                        )
                                                                    )}
                                                                >
                                                                    {
                                                                        item.frequency
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            {carScraping && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
                    <div className="w-full flex flex-col items-center">
                        <div className="text-2xl font-bold mb-2">
                            {formatElapsedTime(elapsedTime)}
                        </div>
                        <div className="text-center">
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
