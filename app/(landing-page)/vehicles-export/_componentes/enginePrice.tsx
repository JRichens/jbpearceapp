"use client"
import { useEffect, useState } from "react"

import useSWR from "swr"

import { GetEnginePrice, UpdateEnginePrice } from "@/actions/enginePrices"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { BreakingVehicle } from "@/types/vehicles"

type Props = {
  priceModal: boolean
  setPriceModal: React.Dispatch<React.SetStateAction<boolean>>
  selectedVehicle: BreakingVehicle | null
}

const EnginePrice = ({ priceModal, setPriceModal, selectedVehicle }: Props) => {
  const { data, error } = useSWR("enginePrice", GetEnginePrice)
  const [enginePrice, setEnginePrice] = useState<number | undefined>(undefined)

  const handleSave = async () => {
    if (enginePrice && selectedVehicle?.car.engineCode) {
      await UpdateEnginePrice(selectedVehicle.car.engineCode, enginePrice)
      setPriceModal(false)
    }
  }

  useEffect(() => {
    setEnginePrice(
      selectedVehicle?.car.enginePrice ? selectedVehicle?.car.enginePrice : 0
    )
  }, [selectedVehicle])

  return (
    <>
      <Dialog
        open={priceModal}
        onOpenChange={setPriceModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Engine Price</DialogTitle>
            <DialogDescription>
              Take the default price or overwrite
            </DialogDescription>
          </DialogHeader>
          <Input
            className="text-xl"
            type="number"
            placeholder="Price"
            value={enginePrice ? enginePrice : undefined}
            onChange={(e) => {
              const value = e.target.value.replace(/^0+/, "")
              setEnginePrice(parseFloat(value))
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave()
              }
            }}
            autoComplete="off"
          />
          <DialogFooter>
            <Button
              onClick={handleSave}
              type="submit"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EnginePrice
