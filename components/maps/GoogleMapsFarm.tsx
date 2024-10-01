'use client'

import Typewriter from 'typewriter-effect'
import {
    GetAllLandAreas,
    AddLandArea,
    UpdateLandArea,
    DeleteLandArea,
} from '@/actions/farmLandArea'
import PolygonModal from './PolygonModalFarm'
import { NewFarmLandArea, LocalFarmPolygon } from '@/types/land-area'
import {
    useState,
    useRef,
    useEffect,
    useCallback,
    startTransition,
} from 'react'
import {
    GoogleMap,
    Polygon,
    DrawingManager,
    useLoadScript,
    Libraries,
    OverlayView,
} from '@react-google-maps/api'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { ThreeCircles } from 'react-loader-spinner'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { ArrowLeft, Download, DownloadIcon } from 'lucide-react'
import CountUp from 'react-countup'
import { convertToBNG } from './convertToBNG'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { GetUser } from '@/actions/get-user'
import Link from 'next/link'

const initialCoords: google.maps.LatLngLiteral = {
    lat: 51.397756,
    lng: -2.641447,
}

const GoogleMapsFarm = () => {
    const libraries = useRef<Libraries>(['drawing'])

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries.current,
    })

    const [lastCoords, setLastCoords] =
        useState<google.maps.LatLngLiteral>(initialCoords)
    const [gettingLandAreas, setGettingLandAreas] = useState(false)
    const [landAreas, setLandAreas] = useState<LocalFarmPolygon[]>([])
    const [currentLandArea, setCurrentLandArea] =
        useState<LocalFarmPolygon | null>(null)
    const [currentPolygon, setCurrentPolygon] =
        useState<google.maps.Polygon | null>(null)

    const [polygonId, setPolygonId] = useState('')
    const [polygonParcelId, setPolygonParcelId] = useState('')
    const [polygonSTid, setPolygonSTid] = useState('')
    const [polygonName, setPolygonName] = useState('')
    const [polygonDescription, setPolygonDescription] = useState('')
    const [polygonActivityCode, setPolygonActivityCode] = useState('')
    const [polygonHectares, setPolygonHectares] = useState('')
    const [polygonAcres, setPolygonAcres] = useState('')
    const [polygonSBIno, setPolygonSBIno] = useState('')
    const [polygonColour, setPolygonColour] = useState('#008B02')

    const [polygonPaths, setPolygonPaths] = useState<
        google.maps.LatLngLiteral[]
    >([])
    const [databasePaths, setDatabasePaths] = useState<string[]>([])
    const [showModal, setShowModal] = useState(false)
    const mapRef = useRef<google.maps.Map | null>(null)
    const [mapZoom, setMapZoom] = useState(15)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [landMenuOpen, setLandMenuOpen] = useState(true)
    const [updatingCreating, setUpdatingCreating] = useState(false)
    const [search, setSearch] = useState('')
    const [userType, setUserType] = useState<string>('')
    const [triggerData, setTriggerData] = useState(false)

    // Grab all the land areas from the database
    useEffect(() => {
        setGettingLandAreas(true)
        const fetchLandAreas = async () => {
            const returnedLandAreas = await GetAllLandAreas()
            // Update all land areas ST numbers
            // for (const landArea of returnedLandAreas) {
            //   // Calculate the ST values of the central LNG and LAT
            //   if (landArea.centerLat && landArea.centerLng) {
            //     // Make sure the centerLat and centerLng properties exist
            //     const [easting, northing] = convertToBNG(
            //       parseFloat(landArea.centerLat.toFixed(6)),
            //       parseFloat(landArea.centerLng.toFixed(6))
            //     )
            //     // Update the land area with the new ST values
            //     const STid = `ST${easting} ${northing}`

            //     // Update the land area in the database
            //     const updated = await UpdateLandAreaColour(landArea.id, "#008B02")
            //   }
            // }

            // Append a polygonRef property with a null reference to each item
            const updatedLandAreas: LocalFarmPolygon[] = returnedLandAreas.map(
                (landArea) => ({
                    ...landArea,
                    polygonRef: null,
                    parcelId: landArea.parcelId!,
                    STid: landArea.STid!,
                    centerLat: landArea.centerLat!,
                    centerLng: landArea.centerLng!,
                    activityCode: landArea.activityCode ?? '', // Use the non-null assertion operator to assert that activityCode is a string
                })
            )
            setLandAreas(updatedLandAreas)
            setGettingLandAreas(false)
        }
        fetchLandAreas()
        setTriggerData(false)
    }, [triggerData])

    const { isSignedIn, user, isLoaded: isUserLoaded } = useUser()
    const userId = isSignedIn ? user?.id : null

    // Get the user
    useEffect(() => {
        const getUserType = async () => {
            if (userId) {
                const user = await GetUser()
                user && setUserType(user.userTypeId)
            }
        }
        getUserType()
    }, [userId])

    const calcCenter = (coordinates: google.maps.LatLngLiteral[]) => {
        const totalLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0)
        const totalLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0)
        const centerLat = totalLat / coordinates.length
        const centerLng = totalLng / coordinates.length
        return { lat: centerLat, lng: centerLng }
    }

    // Handle polygon complete
    const handlePolygonComplete = useCallback(
        async (polygon: google.maps.Polygon) => {
            // Convert the polygon object to an array of coordinates
            const paths = polygon
                .getPath()
                .getArray()
                .map((latLng) => ({
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                }))
            // Update the state with the polygon paths
            setPolygonPaths(paths)
            // Convert the paths to string in format: ["51.39534,-2.622332,","51.39534,-2.622332"]
            const pathsString = paths.map((path) => `${path.lat},${path.lng},`)
            setDatabasePaths(pathsString)
            // Calculate the area of the polygon using the Polygon Geometry library from @react-google-maps/api
            const calculatePolygonArea = (
                paths: google.maps.LatLngLiteral[]
            ): number => {
                const area = google.maps.geometry.spherical.computeArea(paths)
                // convert this to hectares
                const hectares = area / 10000
                return hectares
            }
            // Get the area and centre then show the modal
            const center = calcCenter(paths)
            const [easting, northing] = convertToBNG(
                parseFloat(center.lat.toFixed(6)),
                parseFloat(center.lng.toFixed(6))
            )
            setPolygonSTid(`ST${easting} ${northing}`)

            setTimeout(() => {
                mapRef.current?.panTo(center)
                mapRef.current?.setZoom(16)
            }, 500)
            const area = calculatePolygonArea(paths).toFixed(2)
            setPolygonHectares(area)
            setPolygonAcres((parseFloat(area) * 2.47105).toString())
            setCurrentPolygon(polygon)
            polygon.setEditable(false)
            setShowModal(true)
        },
        []
    )

    // Handle submitting the modal
    const handleModalSubmit = async () => {
        // Find the landArea in the current state
        const currentLandArea = landAreas.find(
            (landArea) => landArea.id === polygonId
        )
        // If the user is farmland, then do not update just close
        if (userType === 'farmland') {
            setUpdatingCreating(false)
            setShowModal(false)
            setPolygonId('')
            setPolygonParcelId('')
            setPolygonSTid('')
            setPolygonName('')
            setPolygonDescription('')
            setPolygonActivityCode('')
            setPolygonHectares('')
            setPolygonAcres('')
            setPolygonColour('')
            setPolygonSBIno('')
            setPolygonPaths([])
            setCurrentPolygon(null)
            return
        }

        // If there is a database entry, then update it
        try {
            setUpdatingCreating(true)
            if (currentLandArea) {
                const returnedUpdatedLandArea = await UpdateLandArea(
                    currentLandArea.id,
                    polygonParcelId,
                    polygonSTid,
                    polygonName,
                    polygonDescription,
                    polygonActivityCode,
                    polygonHectares,
                    polygonAcres,
                    polygonSBIno,
                    polygonColour
                )

                const updatedPolygon: LocalFarmPolygon = {
                    ...returnedUpdatedLandArea,
                    polygonRef: currentPolygon ? currentPolygon : null,
                }
                setLandAreas((prevLandAreas) =>
                    prevLandAreas.map((landArea) =>
                        landArea.id === updatedPolygon.id
                            ? updatedPolygon
                            : landArea
                    )
                )
            } else {
                // Otherwise add it to the database
                currentPolygon && currentPolygon.setMap(null)

                const center = calcCenter(polygonPaths)
                const newLandArea: NewFarmLandArea = {
                    parcelId: polygonParcelId,
                    STid: polygonSTid,
                    name: polygonName,
                    description: polygonDescription,
                    activityCode: polygonActivityCode,
                    hectares: polygonHectares,
                    acres: polygonAcres,
                    SBIno: polygonSBIno,
                    colour: polygonColour,
                    centerLat: center.lat,
                    centerLng: center.lng,
                    coordinates: polygonPaths.map(
                        (path) => `${path.lat},${path.lng}`
                    ),
                }

                // Update the database with the new LandArea object
                const returnedNewPolygon = await AddLandArea({
                    newFarmLandArea: newLandArea,
                })

                // Remove the temp drawn polygon from its ref
                currentPolygon && currentPolygon.setMap(null)

                const newPolygon: LocalFarmPolygon = {
                    ...returnedNewPolygon,
                    polygonRef: currentPolygon ? currentPolygon : null,
                }

                setLandAreas((prevLandAreas) => [...prevLandAreas, newPolygon])

                // Ensure the new polygon has it's click event too to the landAreas reference
                const handleLocalPolygonClick = () => {
                    // Pass the landArea to the click handler
                    handlePolygonClick(newPolygon)
                }

                // Add the click event listener to the polygon
                currentPolygon &&
                    currentPolygon.addListener('click', handleLocalPolygonClick)

                setShowModal(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setUpdatingCreating(false)
            setShowModal(false)
            setPolygonId('')
            setPolygonParcelId('')
            setPolygonSTid('')
            setPolygonName('')
            setPolygonDescription('')
            setPolygonActivityCode('')
            setPolygonHectares('')
            setPolygonAcres('')
            setPolygonColour('')
            setPolygonSBIno('')
            setPolygonPaths([])
            setCurrentPolygon(null)
        }
    }

    // Handle closing the modal
    const handleModalClose = () => {
        // Check if the user is sure they want to delete
        setDeleteConfirmOpen(true)
    }

    // Handle clicking on a polygon
    const handlePolygonClick = (landArea: LocalFarmPolygon) => {
        setCurrentPolygon(landArea.polygonRef)
        setPolygonId(landArea.id)
        setPolygonParcelId(landArea.parcelId ? landArea.parcelId : '')
        setPolygonSTid(landArea.STid ? landArea.STid : '')
        setPolygonName(landArea.name)
        setPolygonDescription(landArea.description)
        setPolygonActivityCode(
            landArea.activityCode ? landArea.activityCode : ''
        )
        setPolygonHectares(landArea.hectares)
        setPolygonAcres(landArea.acres)
        setPolygonSBIno(landArea.SBIno ? landArea.SBIno : '')
        setPolygonColour(landArea.colour)
        setPolygonPaths(
            landArea.coordinates.map((coord) => {
                const [lat, lng] = coord.split(',')
                return { lat: parseFloat(lat), lng: parseFloat(lng) }
            })
        )
        // Define polyCenter using the centerLat and centerLng properties from the landArea object
        if (landArea.centerLat !== null && landArea.centerLng !== null) {
            const polyCenter = {
                lat: landArea.centerLat,
                lng: landArea.centerLng,
            }

            setTimeout(() => {
                mapRef.current?.panTo(polyCenter)
                mapRef.current?.setZoom(17)
            }, 500)
        }

        setDatabasePaths(landArea.coordinates)
        setShowModal(true)
    }

    // Handle the polygon loading and fill the state with each polygonRef
    const handlePolygonLoad = (
        polygon: google.maps.Polygon,
        landAreaId: string
    ) => {
        setLandAreas((prevLandAreas) =>
            prevLandAreas.map((landArea) =>
                landArea.id === landAreaId
                    ? { ...landArea, polygonRef: polygon }
                    : landArea
            )
        )
    }

    // Handle the deletion of a polygon
    const handlePolygonDelete = async () => {
        if (currentPolygon) {
            // if there is a database entry, delete it first
            if (polygonId) {
                await DeleteLandArea(polygonId)
            }

            // Remove the polygon from the map
            currentPolygon.setMap(null)

            // Update the landAreas state by filtering out the deleted polygon
            setLandAreas((prevLandAreas) =>
                prevLandAreas.filter((landArea) => landArea.id !== polygonId)
            )
            // Reset the polygon-related state variables
            setPolygonId('')
            setPolygonParcelId('')
            setPolygonSTid('')
            setPolygonName('')
            setPolygonDescription('')
            setPolygonActivityCode('')
            setPolygonHectares('')
            setPolygonAcres('')
            setPolygonColour('')
            setPolygonPaths([])
            setDatabasePaths([])
            setCurrentPolygon(null)
            setDeleteConfirmOpen(false)
            setShowModal(false)
        } else {
            console.log('No polygon to delete')
        }
    }

    // Render the polygons on the map
    const renderPolygons = () => {
        return landAreas.map((landArea) => {
            const paths = landArea.coordinates.map((coord) => {
                const [lat, lng] = coord.split(',')
                return { lat: parseFloat(lat), lng: parseFloat(lng) }
            })
            return (
                <div key={landArea.id}>
                    <Polygon
                        paths={paths}
                        options={{
                            fillColor: landArea.colour,
                            fillOpacity: 0.4,
                            strokeColor: '#F9F9F9',
                            strokeOpacity: 0.7,
                            strokeWeight: 1,
                        }}
                        onLoad={(polygon) =>
                            handlePolygonLoad(polygon, landArea.id)
                        }
                        onClick={() => {
                            handlePolygonClick(landArea)
                        }}
                    />
                    {mapZoom > 15 &&
                        landArea.centerLat &&
                        landArea.centerLng &&
                        landArea.name && (
                            <OverlayView
                                position={{
                                    lat: landArea.centerLat,
                                    lng: landArea.centerLng,
                                }} // pass as an object instead of an array
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div className="bg-black bg-opacity-40 text-white p-2 rounded-xl w-[85px]">{`${landArea.name}`}</div>
                            </OverlayView>
                        )}
                </div>
            )
        })
    }

    // Render the loading message
    const renderLoading = () => {
        return (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
                <Typewriter
                    options={{
                        strings: [
                            'Loading land areas...',
                            'Mapping coordinates...',
                            'Please wait...',
                        ],
                        autoStart: true,
                        loop: true,
                    }}
                />
                <ThreeCircles color="#d3c22a" />
            </div>
        )
    }

    // Render a menu on the left hand side with a list of all land areas
    const renderMenu = () => {
        // Get the total of all the areas
        const totalArea = landAreas.reduce(
            (a, b) => a + parseFloat(b.hectares),
            0
        )

        return (
            <div className="">
                <ScrollArea
                    className="mt-2 h-[calc(100vh-90px)] overflow-auto"
                    type="scroll"
                >
                    <div className="drop-shadow-lg flex flex-col sticky top-0 bg-white mb-2">
                        <div className="flex flex-col px-3 pb-2">
                            <div className="flex flex-row items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Land Areas
                                </h2>
                            </div>

                            <p>Total Fields: {landAreas.length}</p>
                            <div className="flex flex-row items-center justify-between">
                                <p>
                                    Total Hectares:{' '}
                                    <CountUp end={totalArea} decimals={1.5} />
                                </p>
                                <Link href="/api/farmlandexport">
                                    <div className="flex flex-row items-center border-solid border-[1px] border-slate-200 rounded-md px-2 py-1 bg-slate-100 hover:bg-slate-200">
                                        <DownloadIcon className="w-5 h-5 mr-1" />
                                        Export
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <Input
                            className="mb-2 ml-2 w-[95%] text-lg"
                            placeholder="Search..."
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <ul className="mt-1 px-3">
                        {landAreas
                            .filter((landArea) => {
                                const searchFields = [
                                    landArea.STid,
                                    landArea.activityCode,
                                    landArea.name,
                                    landArea.description,
                                ]
                                return searchFields.some(
                                    (field) =>
                                        field !== null &&
                                        field
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                )
                            })
                            .sort((a, b) => a.STid!.localeCompare(b.STid!))
                            .map((landArea, index) => (
                                <li
                                    key={landArea.id}
                                    className="mb-1 cursor-pointer hover:shadow-lg "
                                    onClick={() => {
                                        if (landArea.polygonRef) {
                                            const bounds =
                                                new window.google.maps.LatLngBounds()
                                            landArea.polygonRef
                                                .getPath()
                                                .forEach((latLng) => {
                                                    bounds.extend(latLng)
                                                })
                                            mapRef.current?.fitBounds(bounds)
                                        }
                                    }}
                                >
                                    <div
                                        className={cn(
                                            'flex flex-col px-3 py-2 rounded-md hover:border-2 hover:border-slate-100',
                                            index % 2 === 0 && 'bg-slate-100'
                                        )}
                                    >
                                        <div>
                                            <div className="flex flex-row items-center justify-between">
                                                <div
                                                    className={cn(
                                                        ' rounded-full w-22 px-2 bg-gold text-white'
                                                    )}
                                                >
                                                    {landArea.STid}
                                                </div>
                                                <div className="ml-2 font-semibold border px-2 rounded-md border-darkgold">
                                                    {landArea.activityCode}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center justify-between">
                                            <div>{landArea.name}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ul>
                    <ScrollBar />
                </ScrollArea>
                <div className="w-[100%] h-[70px]  relative shadow-[0_-15px_15px_-15px_rgba(0,0,0,0.2)]"></div>
            </div>
        )
    }

    return isLoaded ? (
        <>
            <ResizablePanelGroup direction="horizontal" className="bg-white">
                <ResizablePanel defaultSize={20}>
                    {gettingLandAreas ? null : landMenuOpen && renderMenu()}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                    <GoogleMap
                        mapContainerStyle={{ height: '100%', width: '100%' }}
                        zoom={mapZoom}
                        center={lastCoords}
                        options={{
                            mapTypeId: 'hybrid',
                            zoomControl: true,
                            mapTypeControl: false,
                            streetViewControl: false,
                        }}
                        onLoad={(map) => {
                            mapRef.current = map
                            map.addListener('zoom_changed', function () {
                                const zoom = map.getZoom()
                                zoom && setMapZoom(zoom)
                            })
                        }}
                    >
                        {/* Map out and render any polygons from the landAreas state */}
                        {gettingLandAreas ? renderLoading() : renderPolygons()}
                        {mapRef.current && (
                            <DrawingManager
                                onPolygonComplete={handlePolygonComplete}
                                options={{
                                    drawingMode: null,
                                    drawingControl: true,
                                    drawingControlOptions: {
                                        position:
                                            window.google.maps.ControlPosition
                                                .TOP_CENTER,
                                        drawingModes: [
                                            window.google.maps.drawing
                                                .OverlayType.POLYGON,
                                        ],
                                    },
                                    polygonOptions: {
                                        fillColor: polygonColour,
                                        fillOpacity: 0.4,
                                        strokeColor: 'white',
                                        strokeOpacity: 1,
                                        strokeWeight: 1,
                                        editable: true,
                                        draggable: false,
                                        clickable: true,
                                        map: mapRef.current,
                                    },
                                }}
                            />
                        )}
                    </GoogleMap>
                </ResizablePanel>
            </ResizablePanelGroup>

            {showModal && (
                <PolygonModal
                    onSubmit={handleModalSubmit}
                    onClose={handleModalClose}
                    polygonParcelId={polygonParcelId}
                    setPolygonParcelId={setPolygonParcelId}
                    polygonSTid={polygonSTid}
                    setPolygonSTid={setPolygonSTid}
                    polygonName={polygonName}
                    setPolygonName={setPolygonName}
                    polygonDescription={polygonDescription}
                    setPolygonDescription={setPolygonDescription}
                    polygonActivityCode={polygonActivityCode}
                    setPolygonActivityCode={setPolygonActivityCode}
                    polygonHectares={polygonHectares}
                    setPolygonHectares={setPolygonHectares}
                    polygonAcres={polygonAcres}
                    setPolygonAcres={setPolygonAcres}
                    polygonSBIno={polygonSBIno}
                    setPolygonSBIno={setPolygonSBIno}
                    polygonColour={polygonColour}
                    setPolygonColour={setPolygonColour}
                    userType={userType}
                    setShowModal={setShowModal}
                />
            )}

            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will delete the the current land area and
                            cannot be undone
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteConfirmOpen(false)
                            }}
                        >
                            No
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handlePolygonDelete}
                        >
                            Yes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    ) : (
        <></>
    )
}

export default GoogleMapsFarm
