"use client"

import { ReactNode, useState } from "react"

import { Car } from "@prisma/client"
import { CopyToClipboard } from "react-copy-to-clipboard"

import { keyMap } from "@/types/keymaps"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Form } from "../_components/reg-form"

import { Check } from "lucide-react"

const VehiclesAPI = () => {
  const [vehicle, setVehicle] = useState<Car | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyClick = () => {
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
      <h1 className="font-bold text-2xl">Vehicles API</h1>
      <p>Search for all vehicle related data</p>
      <Separator className="mt-2 mb-6" />
      <Form setVehicle={setVehicle} />
      {vehicle?.vinOriginalDvla && (
        <table className="table-auto mt-4">
          <tbody>
            <tr>
              <td className="border px-4 py-2">Last 6 VIN</td>
              <td className=" border px-4 py-2">
                <div className="flex items-center">
                  <span id="copyVIN">{vehicle.vinOriginalDvla.slice(-6)}</span>
                  <span className="ml-2">
                    <CopyToClipboard
                      text={vehicle.vinOriginalDvla.slice(-6)}
                      onCopy={handleCopyClick}
                    >
                      <Button
                        variant="outline"
                        className="w-14 h-8"
                      >
                        {isCopied ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          "Copy"
                        )}
                      </Button>
                    </CopyToClipboard>
                  </span>
                </div>
              </td>
            </tr>
            {vehicle.enginePrice ? (
              <tr>
                <td className="border px-4 py-2 font-semibold text-red-600">
                  Engine Export
                </td>
                <td className="border px-4 py-2 font-semibold">
                  £ {vehicle.enginePrice}
                </td>
              </tr>
            ) : null}
            {Object.entries(vehicle)
              .filter(
                ([key, _]) =>
                  ![
                    "uniqueId",
                    "exportVehicle",
                    "addedToExport",
                    "breakingVehicle",
                    "addedToBreaking",
                    "createdAt",
                    "updatedAt",
                    "enginePrice",
                  ].includes(key)
              )
              .map(([key, value]) => (
                <tr key={key}>
                  <td className="border px-4 py-2">{keyMap[key] || key}</td>
                  <td className="border px-4 py-2">{value as ReactNode}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
export default VehiclesAPI
