"use client"

import Typewriter from "typewriter-effect"
import {
  GetAllLandAreas,
  AddLandArea,
  UpdateLandArea,
  DeleteLandArea,
} from "@/actions/landArea"
import PolygonModal from "./PolygonModal"
import { NewLandArea, LocalPolygon } from "@/types/land-area"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  GoogleMap,
  Polygon,
  DrawingManager,
  useLoadScript,
  Libraries,
} from "@react-google-maps/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { ThreeCircles } from "react-loader-spinner"
import { ScrollArea } from "../ui/scroll-area"
import { ArrowLeft } from "lucide-react"
import CountUp from "react-countup"
import { convertToBNG } from "./convertToBNG"

const initialCoords: google.maps.LatLngLiteral = {
  lat: 51.397756,
  lng: -2.641447,
}

const GoogleMaps = () => {
  const libraries = useRef<Libraries>(["drawing"])

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries.current,
  })

  const [lastCoords, setLastCoords] =
    useState<google.maps.LatLngLiteral>(initialCoords)
  const [gettingLandAreas, setGettingLandAreas] = useState(false)
  const [landAreas, setLandAreas] = useState<LocalPolygon[]>([])
  const [currentPolygon, setCurrentPolygon] =
    useState<google.maps.Polygon | null>(null)
  const [polygonId, setPolygonId] = useState("")
  const [polygonSTid, setPolygonSTid] = useState("")
  const [polygonDescription, setPolygonDescription] = useState("")
  const [polygonColour, setPolygonColour] = useState("#008B02")
  const [polygonArea, setPolygonArea] = useState("")
  const [polygonPaths, setPolygonPaths] = useState<google.maps.LatLngLiteral[]>(
    []
  )
  const [databasePaths, setDatabasePaths] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [landMenuOpen, setLandMenuOpen] = useState(true)
  const [updatingCreating, setUpdatingCreating] = useState(false)

  // Grab all the land areas from the database
  useEffect(() => {
    setGettingLandAreas(true)
    const fetchLandAreas = async () => {
      const returnedLandAreas = await GetAllLandAreas()
      // Append a polygonRef property with a null reference to each item
      const updatedLandAreas: LocalPolygon[] = returnedLandAreas.map(
        (landArea) => ({
          ...landArea,
          polygonRef: null,
        })
      )
      setLandAreas(updatedLandAreas)
      setGettingLandAreas(false)
    }
    fetchLandAreas()
  }, [])

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
      setPolygonSTid("ST" + easting.toString() + " " + northing.toString())

      setTimeout(() => {
        mapRef.current?.panTo(center)
        mapRef.current?.setZoom(16)
      }, 500)
      const area = calculatePolygonArea(paths).toFixed(2)
      setPolygonArea(area)
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
      (landArea) => landArea.STid === polygonSTid
    )
    // If there is a database entry, then update it
    try {
      setUpdatingCreating(true)
      if (currentLandArea) {
        const returnedUpdatedLandArea = await UpdateLandArea(
          currentLandArea.id,
          polygonSTid,
          polygonDescription,
          polygonColour,
          polygonArea
        )
        const updatedPolygon: LocalPolygon = {
          ...returnedUpdatedLandArea,
          polygonRef: currentPolygon ? currentPolygon : null,
        }
        setLandAreas((prevLandAreas) =>
          prevLandAreas.map((landArea) =>
            landArea.STid === updatedPolygon.STid ? updatedPolygon : landArea
          )
        )
      } else {
        // Otherwise add it to the database
        currentPolygon && currentPolygon.setMap(null)

        const center = calcCenter(polygonPaths)
        const newLandArea: NewLandArea = {
          STid: polygonSTid,
          issuedDate: new Date().toISOString(),
          description: polygonDescription,
          area: polygonArea,
          colour: polygonColour,
          centerLat: center.lat,
          centerLng: center.lng,
          coordinates: databasePaths,
        }

        // Update the database with the new LandArea object
        const returnedNewPolygon = await AddLandArea({ newLandArea })

        const newPolygon: LocalPolygon = {
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
          currentPolygon.addListener("click", handleLocalPolygonClick)

        setShowModal(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setUpdatingCreating(false)
      setShowModal(false)
      setPolygonId("")
      setPolygonSTid("")
      setPolygonDescription("")
      setPolygonColour("")
      setPolygonArea("")
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
  const handlePolygonClick = (landArea: LocalPolygon) => {
    setCurrentPolygon(landArea.polygonRef)
    setPolygonId(landArea.id)
    setPolygonSTid(landArea.STid)
    setPolygonDescription(landArea.description)
    setPolygonColour(landArea.colour)
    setPolygonArea(landArea.area)
    setPolygonPaths(
      landArea.coordinates.map((coord) => {
        const [lat, lng] = coord.split(",")
        return { lat: parseFloat(lat), lng: parseFloat(lng) }
      })
    )
    // Define polyCenter using the centerLat and centerLng properties from the landArea object
    if (landArea.centerLat !== null && landArea.centerLng !== null) {
      const polyCenter = { lat: landArea.centerLat, lng: landArea.centerLng }

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
        await DeleteLandArea(polygonSTid)
      }

      // Before removing the polygon, the the last centre coords of the polygon in state
      // First find the landArea in state from it's STid
      const currentLandArea = landAreas.find(
        (landArea) => landArea.STid === polygonSTid
      )
      if (currentLandArea?.centerLat && currentLandArea?.centerLng) {
        setLastCoords({
          lat: currentLandArea?.centerLat,
          lng: currentLandArea?.centerLng,
        })
      }
      // Remove the polygon from the map
      currentPolygon.setMap(null)

      // Update the landAreas state by filtering out the deleted polygon
      setLandAreas((prevLandAreas) =>
        prevLandAreas.filter((landArea) => landArea.id !== polygonId)
      )

      // Reset the polygon-related state variables
      setCurrentPolygon(null)
      setPolygonPaths([])
      setPolygonArea("")
      setPolygonId("")
      setPolygonSTid("")
      setPolygonDescription("")
      setPolygonColour("")
      setDatabasePaths([])
      setShowModal(false)
      setDeleteConfirmOpen(false)
    } else {
      console.log("No polygon to delete")
    }
  }

  // Render the polygons on the map
  const renderPolygons = () => {
    return landAreas.map((landArea) => {
      const paths = landArea.coordinates.map((coord) => {
        const [lat, lng] = coord.split(",")
        return { lat: parseFloat(lat), lng: parseFloat(lng) }
      })
      return (
        <Polygon
          key={landArea.id}
          paths={paths}
          options={{
            fillColor: landArea.colour,
            fillOpacity: 0.4,
            strokeColor: "#F9F9F9",
            strokeOpacity: 0.7,
            strokeWeight: 1,
          }}
          onLoad={(polygon) => handlePolygonLoad(polygon, landArea.id)}
          onClick={() => {
            handlePolygonClick(landArea)
          }}
        />
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
              "Loading land areas...",
              "Mapping coordinates...",
              "Please wait...",
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
    const totalArea = landAreas.reduce((a, b) => a + parseFloat(b.area), 0)

    return (
      <div className="absolute left-0 top-0 bg-white rounded-lg shadow-lg w-[250px] h-screen">
        <ScrollArea className="mt-20 h-[calc(100%-160px)]">
          <div className="drop-shadow-lg flex flex-col sticky top-0 bg-white mb-2">
            <div className="flex flex-col px-3 pb-2">
              <h2 className="text-lg font-bold mb-2">Land Areas</h2>
              <p>Total Areas: {landAreas.length}</p>
              <p>
                Total Hectares:{" "}
                <CountUp
                  end={totalArea}
                  decimals={1.5}
                />
              </p>
            </div>
          </div>
          <ul className="mt-1 px-3">
            {landAreas
              .sort((a, b) => a.STid.localeCompare(b.STid))
              .map((landArea) => (
                <li
                  key={landArea.id}
                  className="mb-1 cursor-pointer hover:font-bold hover:bg-slate-200"
                  onClick={() => {
                    if (landArea.polygonRef) {
                      const bounds = new window.google.maps.LatLngBounds()
                      landArea.polygonRef.getPath().forEach((latLng) => {
                        bounds.extend(latLng)
                      })
                      mapRef.current?.fitBounds(bounds)
                    }
                  }}
                >
                  {landArea.STid} - {landArea.description}
                </li>
              ))}
          </ul>
        </ScrollArea>
        <div className="relative shadow-[0_-15px_15px_-15px_rgba(0,0,0,0.2)]">
          <Button
            variant="outline"
            onClick={() => setLandMenuOpen(false)}
            className="m-4"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Menu
          </Button>
        </div>
      </div>
    )
  }

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        zoom={15}
        center={lastCoords}
        options={{
          mapTypeId: "hybrid",
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
        }}
        onLoad={(map) => {
          mapRef.current = map
        }}
      >
        {/* Map out and render any polygons from the landAreas state */}
        {gettingLandAreas ? renderLoading() : renderPolygons()}
        <DrawingManager
          onPolygonComplete={handlePolygonComplete}
          options={{
            drawingMode: null,
            drawingControl: true,
            drawingControlOptions: {
              position: window.google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
              fillColor: polygonColour,
              fillOpacity: 0.4,
              strokeColor: "white",
              strokeOpacity: 1,
              strokeWeight: 1,
              editable: true,
              draggable: false,
              clickable: true,
              map: mapRef.current,
            },
          }}
        />
      </GoogleMap>
      {gettingLandAreas ? null : landMenuOpen && renderMenu()}
      {showModal && (
        <PolygonModal
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
          polygonSTid={polygonSTid}
          setPolygonSTid={setPolygonSTid}
          polygonDescription={polygonDescription}
          setPolygonDescription={setPolygonDescription}
          polygonColour={polygonColour}
          setPolygonColour={setPolygonColour}
          polygonArea={polygonArea}
          setPolygonArea={setPolygonArea}
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
              This will delete the the current land area and cannot be undone
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

export default GoogleMaps
