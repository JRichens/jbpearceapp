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
  polygonParcelId: string
  setPolygonParcelId: Dispatch<SetStateAction<string>>
  polygonSTid: string
  setPolygonSTid: Dispatch<SetStateAction<string>>
  polygonName: string
  setPolygonName: Dispatch<SetStateAction<string>>
  polygonDescription: string
  setPolygonDescription: Dispatch<SetStateAction<string>>
  polygonActivityCode: string
  setPolygonActivityCode: Dispatch<SetStateAction<string>>
  polygonHectares: string
  setPolygonHectares: Dispatch<SetStateAction<string>>
  polygonAcres: string
  setPolygonAcres: Dispatch<SetStateAction<string>>
  polygonColour: string
  setPolygonColour: Dispatch<SetStateAction<string>>
  userType: string
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const PolygonModal: React.FC<PolygonModalProps> = ({
  onSubmit,
  onClose,
  polygonParcelId,
  setPolygonParcelId,
  polygonSTid,
  setPolygonSTid,
  polygonName,
  setPolygonName,
  polygonDescription,
  setPolygonDescription,
  polygonActivityCode,
  setPolygonActivityCode,
  polygonHectares,
  setPolygonHectares,
  polygonAcres,
  setPolygonAcres,
  polygonColour,
  setPolygonColour,
  userType,
  setShowModal,
}) => {
  const handleSubmit = () => {
    onSubmit()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-end">
      <div className="bg-white rounded shadow-lg m-4 max-h-[65vh] overflow-hidden overflow-y-auto">
        <h2 className="sticky top-0 bg-white w-full px-3 pt-3 pb-2 text-xl font-bold drop-shadow-md mb-3">
          Land Detail
        </h2>
        <div className="px-4 pb-4">
          <div className="flex flex-row gap-4">
            <div>
              {" "}
              <Label
                htmlFor="ST Coordinates"
                className="block mb-1"
              >
                ST Coordinates
              </Label>
              <Input
                id="ST Coordinates"
                className="text-lg w-[140px] border border-gray-300 rounded px-2 py-1 mb-2"
                value={polygonSTid}
                onChange={(e) => setPolygonSTid(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="activityCode"
                className="block mb-1"
              >
                Activity Code
              </Label>
              <Input
                type="text"
                id="activityCode"
                value={polygonActivityCode}
                onChange={(e) => setPolygonActivityCode(e.target.value)}
                placeholder=""
                className="text-lg w-[150px] border border-gray-300 rounded px-2 py-1 mb-2"
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
                htmlFor="hectares"
                className="block mb-1"
              >
                Hectares
              </Label>
              <Input
                type="text"
                id="area"
                value={parseFloat(polygonHectares).toFixed(2).toString()}
                onChange={(e) => setPolygonHectares(e.target.value)}
                className="text-lg w-[150px] border border-gray-300 rounded px-2 py-1 mb-2"
              />
            </div>
            <div>
              <Label
                htmlFor="acres"
                className="block mb-1"
              >
                Acres
              </Label>
              <Input
                type="text"
                id="acres"
                value={parseFloat(polygonAcres).toFixed(2).toString()}
                onChange={(e) => setPolygonAcres(e.target.value)}
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
        </div>
      </div>
    </div>
  )
}

export default PolygonModal
