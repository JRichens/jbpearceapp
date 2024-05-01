"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { GithubPicker } from "react-color"
import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ScrollArea } from "../ui/scroll-area"

interface PolygonModalProps {
  onSubmit: () => void
  onClose: () => void
  polygonSTid: string
  setPolygonSTid: Dispatch<SetStateAction<string>>
  polygonDescription: string
  setPolygonDescription: Dispatch<SetStateAction<string>>
  polygonColour: string
  setPolygonColour: Dispatch<SetStateAction<string>>
  polygonArea: string
  setPolygonArea: Dispatch<SetStateAction<string>>
  polygonPlotNo: string
  setPolygonPlotNo: Dispatch<SetStateAction<string>>
  polygonRegNo: string
  setPolygonRegNo: Dispatch<SetStateAction<string>>
  polygonPurchaseDate: string
  setPolygonPurchaseDate: Dispatch<SetStateAction<string>>
  polygonPurchasePrice: number
  setPolygonPurchasePrice: Dispatch<SetStateAction<number>>
  polygonName: string
  setPolygonName: Dispatch<SetStateAction<string>>
  polygonOwnership: string
  setPolygonOwnership: Dispatch<SetStateAction<string>>
  polygonAgValue: number
  setPolygonAgValue: Dispatch<SetStateAction<number>>
  polygonHopeValue: number
  setPolygonHopeValue: Dispatch<SetStateAction<number>>
  polygonType: string
  setPolygonType: Dispatch<SetStateAction<string>>
  userType: string
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const PolygonModal: React.FC<PolygonModalProps> = ({
  onSubmit,
  onClose,
  polygonSTid,
  setPolygonSTid,
  polygonDescription,
  setPolygonDescription,
  polygonColour,
  setPolygonColour,
  polygonArea,
  setPolygonArea,
  polygonPlotNo,
  setPolygonPlotNo,
  polygonRegNo,
  setPolygonRegNo,
  polygonPurchaseDate,
  setPolygonPurchaseDate,
  polygonPurchasePrice,
  setPolygonPurchasePrice,
  polygonName,
  setPolygonName,
  polygonOwnership,
  setPolygonOwnership,
  polygonAgValue,
  setPolygonAgValue,
  polygonHopeValue,
  setPolygonHopeValue,
  polygonType,
  setPolygonType,
  userType,
  setShowModal,
}) => {
  const handleSubmit = () => {
    onSubmit()
  }

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (polygonPurchaseDate) {
      // if polygonPurchaseDate contains "/"
      if (polygonPurchaseDate.indexOf("/") > 0) {
        const [day, month, year] = polygonPurchaseDate.split("/")
        return new Date(Number(year), Number(month) - 1, Number(day))
      } else {
        // if polygonPurchaseDate contains "-"
        const [day, month, year] = polygonPurchaseDate.split("-")
        return new Date(Number(year), Number(month) - 1, Number(day))
      }
    }
    return null
  })

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-end">
      <div className="bg-white rounded shadow-lg m-4 max-h-[65vh] overflow-hidden overflow-y-auto">
        <h2 className="sticky top-0 bg-white w-full px-3 pt-3 pb-2 text-xl font-bold drop-shadow-md mb-3">
          Land Detail
        </h2>
        <div className="px-4 pb-4">
          <div className="flex flex-row gap-2">
            <div>
              {" "}
              <Label
                htmlFor="plotNo"
                className="block mb-1"
              >
                Plot No
              </Label>
              <Input
                id="plotNo"
                className="text-lg w-[55px] border border-gray-300 rounded px-2 py-1 mb-2"
                value={polygonPlotNo}
                onChange={(e) => {
                  let value = e.target.value

                  // Remove any leading zeros if number is more than one digit
                  value = Number(value).toString()

                  // Limit input to three characters
                  value = value.slice(0, 3)

                  // Prepend zeros if necessary
                  value = value.padStart(3, "0")

                  setPolygonPlotNo(value)
                }}
              />
            </div>
            <div>
              {" "}
              <Label
                htmlFor="registryNo"
                className="block mb-1"
              >
                Registry No
              </Label>
              <Input
                id="registryNo"
                className="text-lg w-[215px] border border-gray-300 rounded px-2 py-1 mb-2"
                value={polygonRegNo}
                onChange={(e) => setPolygonRegNo(e.target.value)}
              />
            </div>
          </div>

          <Label
            htmlFor="name"
            className="block mb-1"
          >
            Name
          </Label>
          <Input
            id="name"
            className="text-lg w-full border border-gray-300 rounded px-2 py-1 mb-2"
            value={polygonName}
            onChange={(e) => setPolygonName(e.target.value)}
          />

          <Label
            htmlFor="ownership"
            className="block mb-1"
          >
            Ownership
          </Label>
          <Input
            id="ownership"
            className="text-lg w-full border border-gray-300 rounded px-2 py-1 mb-2"
            value={polygonOwnership}
            onChange={(e) => setPolygonOwnership(e.target.value)}
          />

          <Label
            htmlFor="type"
            className="block mb-1"
          >
            Type
          </Label>
          <Input
            id="type"
            className="text-lg w-full border border-gray-300 rounded px-2 py-1 mb-2"
            value={polygonType ? polygonType : ""}
            onChange={(e) => setPolygonType(e.target.value)}
          />

          <Label
            htmlFor="description"
            className="block mb-1"
          >
            Description
          </Label>
          <textarea
            id="description"
            value={polygonDescription}
            onChange={(e) => setPolygonDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
          ></textarea>

          <div className="flex flex-row items-center gap-3">
            <div>
              <Label
                htmlFor="purchaseDate"
                className="block mb-1"
              >
                Purchase Date
              </Label>
              <DatePicker
                id="purchaseDate"
                selected={selectedDate}
                onChange={(date) => {
                  console.log("date: " + date)
                  const formattedDate = date
                    ? date.toLocaleDateString("en-GB")
                    : ""
                  console.log("formattedDate: " + formattedDate)
                  setPolygonPurchaseDate(formattedDate)
                  setSelectedDate(date)
                }}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-[150px] h-[40px] border border-gray-300 rounded px-2 py-1 mb-2 text-lg"
              />
            </div>
            <div>
              <Label
                htmlFor="purchasePrice"
                className="block mb-1"
              >
                Purchase Price
              </Label>
              <div className="relative">
                <div className="absolute left-0 top-0 mt-[1px] ml-[1px] text-lg pt-[7px] pb-[3px] px-2 bg-slate-100 rounded-l-md">
                  £
                </div>
                <Input
                  id="purchasePrice"
                  className="text-lg pl-8 w-[150px] border border-gray-300 rounded pr-2 py-1 mb-2"
                  value={polygonPurchasePrice.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "")
                    if (value === "") {
                      setPolygonPurchasePrice(0)
                    } else {
                      const parsedValue = parseFloat(value)
                      if (!isNaN(parsedValue)) {
                        setPolygonPurchasePrice(parsedValue)
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            <div>
              <Label
                htmlFor="agValue"
                className="block mb-1"
              >
                Value
              </Label>
              <div className="relative">
                <div className="absolute left-0 top-0 mt-[1px] ml-[1px] text-lg pt-[7px] pb-[3px] px-2 bg-slate-100 rounded-l-md">
                  £
                </div>
                <Input
                  id="agValue"
                  className="text-lg pl-8 w-[150px] border border-gray-300 rounded pr-2 py-1 mb-2"
                  value={polygonAgValue ? polygonAgValue.toLocaleString() : "0"}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "")
                    if (value === "") {
                      setPolygonAgValue(0)
                    } else {
                      const parsedValue = parseFloat(value)
                      if (!isNaN(parsedValue)) {
                        setPolygonAgValue(parsedValue)
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="hopeValue"
                className="block mb-1"
              >
                Hope Value
              </Label>
              <div className="relative">
                <div className="absolute left-0 top-0 mt-[1px] ml-[1px] text-lg pt-[7px] pb-[3px] px-2 bg-slate-100 rounded-l-md">
                  £
                </div>
                <Input
                  id="hopeValue"
                  className="text-lg pl-8 w-[150px] border border-gray-300 rounded pr-2 py-1 mb-2"
                  value={
                    polygonHopeValue ? polygonHopeValue.toLocaleString() : "0"
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "")
                    if (value === "") {
                      setPolygonHopeValue(0)
                    } else {
                      const parsedValue = parseFloat(value)
                      if (!isNaN(parsedValue)) {
                        setPolygonHopeValue(parsedValue)
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            <div>
              <Label
                htmlFor="stid"
                className="block mb-1"
              >
                ST Coordinates
              </Label>
              <Input
                type="text"
                id="stid"
                value={polygonSTid}
                onChange={(e) => setPolygonSTid(e.target.value)}
                placeholder="ST5566 7788..."
                className="text-lg w-[150px] border border-gray-300 rounded px-2 py-1 mb-2"
              />
            </div>
            <div>
              <Label
                htmlFor="area"
                className="block mb-1"
              >
                Area (hectares)
              </Label>
              <Input
                type="text"
                id="area"
                value={parseFloat(polygonArea).toFixed(2).toString()}
                onChange={(e) => setPolygonArea(e.target.value)}
                className="text-lg w-[150px] border border-gray-300 rounded px-2 py-1 mb-2"
              />
            </div>
          </div>
          <Label
            htmlFor="colour"
            className="block mb-1"
          >
            Colour
          </Label>
          <GithubPicker
            className="mb-2 w-full"
            color={polygonColour}
            onChange={(colour) => setPolygonColour(colour.hex)}
          />
        </div>
        <div className="flex w-full px-4 pt-3 pb-4 justify-between bg-white sticky bottom-0 drop-shadow-up-md">
          {userType !== "land" && (
            <>
              <Button
                onClick={handleSubmit}
                className=""
              >
                Ok
              </Button>
              <Button
                onClick={onClose}
                variant="destructive"
                className=""
              >
                <Trash2 className="w-6 h-6" />
              </Button>
            </>
          )}
          {userType === "land" && (
            <Button
              onClick={() => setShowModal(false)}
              className=""
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PolygonModal
