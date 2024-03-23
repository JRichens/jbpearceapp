"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { GetBreakingVehicles } from "@/actions/get-breakVehicles"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import moment from "moment"
import NewVehicleDialog from "./_componentes/newVehicleDialog"
import { BreakingVehicle } from "@/types/vehicles"
import { ConfirmDel } from "./_componentes/confirmDel"
import Typewriter from "typewriter-effect"
import { ThreeCircles } from "react-loader-spinner"
import { GetUser } from "@/actions/get-user"

const BreakingVehicles = () => {
  const [search, setSearch] = useState("")
  const [vehicles, setVehicles] = useState<BreakingVehicle[]>()
  const [selectedVehicle, setSelectedVehicle] =
    useState<BreakingVehicle | null>(null)
  const [newVehicleDialog, setNewVehicleDialog] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [userType, setUserType] = useState("")

  useEffect(() => {
    // Fetch user type
    const fetchUser = async () => {
      const user = await GetUser()
      user && setUserType(user.userTypeId)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchVehicles = async () => {
      const vehicles = await GetBreakingVehicles()
      console.log("fetching vehicles repeat")
      if (vehicles) {
        setVehicles(vehicles)
      }
    }

    const timer = setTimeout(() => {
      fetchVehicles()
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [vehicles])

  return (
    <>
      <div className="max-w-3xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
        <h1 className="font-bold text-2xl">Breaking Vehicles</h1>
        <p>Search for vehicles that are breaking</p>

        <div className="flex flex-row gap-3 mt-4">
          <Input
            id="search"
            placeholder="Search details.."
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            type="search"
            name="search"
            autoFocus
            className="text-lg"
          />
          {userType !== "user" && (
            <Button
              onClick={() => setNewVehicleDialog(true)}
              variant={"secondary"}
              className="text-lg "
            >
              <Plus className="pr-1 h-6 w-6" />
              Add
            </Button>
          )}
        </div>
        {/* Map out the vehicles */}
        {!vehicles && (
          <>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
              <Typewriter
                options={{
                  strings: ["Loading vehicles...", "Please wait..."],
                  autoStart: true,
                  loop: true,
                }}
              />
              <ThreeCircles color="#d3c22a" />
            </div>
          </>
        )}
        {vehicles && (
          <div
            className={cn(`
              mt-3
              flex
              flex-row
              flex-wrap
              items-center
              gap-3
              `)}
          >
            {vehicles
              .sort((a, b) => moment(b.created).diff(moment(a.created)))
              .filter((vehicle) => {
                const searchTerms = search.toLowerCase().split(" ")
                const {
                  dvlaMake,
                  dvlaModel,
                  nomCC,
                  fuelType,
                  transmission,
                  dvlaYearOfManufacture,
                  modelSeries,
                } = vehicle.car

                const modelText = dvlaModel?.split(" ").slice(0, 2).join(" ")
                const ccText = nomCC?.includes(".") ? nomCC : `${nomCC}.0`
                const transmissionText = transmission?.includes("AUTOMATIC")
                  ? "AUTO"
                  : transmission
                const modelSeriesText = modelSeries?.split(" ")[0]

                const vehicleText = [
                  dvlaMake,
                  modelText,
                  ccText,
                  fuelType,
                  transmissionText,
                  dvlaYearOfManufacture?.toString(),
                  modelSeriesText,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase()

                return searchTerms.every((term) => vehicleText.includes(term))
              })
              .map((vehicle) => (
                <div
                  className={cn(`
                    flex
                    flex-col
                    min-w-[300px]
                    min-h-[190px]
                    border
                    border-slate-200
                    p-1
                    rounded-md
                    shadow-sm
                    cursor-pointer
                    hover:shadow-md`)}
                  key={vehicle.id}
                >
                  <div className="flex flex-row flex-grow justify-between">
                    <Image
                      src={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                      width={140}
                      height={140}
                      alt=""
                    />
                    <Image
                      src={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                      width={140}
                      height={140}
                      style={{
                        transform: "scaleX(-1)",
                      }}
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium">
                      {vehicle.car.dvlaMake}{" "}
                      {vehicle.car.dvlaModel?.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p>
                      {vehicle.car.nomCC?.includes(".")
                        ? vehicle.car.nomCC
                        : `${vehicle.car.nomCC}.0`}{" "}
                      {vehicle.car.fuelType}{" "}
                      {vehicle.car.transmission?.includes("AUTOMATIC")
                        ? "AUTO"
                        : vehicle.car.transmission}
                      {" - "}
                      {vehicle.car.dvlaYearOfManufacture}
                      {" ("}
                      {vehicle.car.modelSeries?.split(" ")[0]}
                      {")"}
                    </p>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex flex-row justify-between items-center">
                    <p>Added {moment(vehicle.created).fromNow()}</p>
                    {userType !== "user" && (
                      <Button
                        onClick={() => {
                          setConfirmDel(true)
                          setSelectedVehicle(vehicle)
                        }}
                        className="bg-red-700 p-1.5 py-0 h-8 hover:opacity-50 hover:bg-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <NewVehicleDialog
        newVehicleDialog={newVehicleDialog}
        setNewVehicleDialog={setNewVehicleDialog}
        search={search}
        setSearch={setSearch}
      />
      {selectedVehicle && (
        <ConfirmDel
          open={confirmDel}
          setOpen={setConfirmDel}
          reg={selectedVehicle?.carReg}
        />
      )}
    </>
  )
}

export default BreakingVehicles
