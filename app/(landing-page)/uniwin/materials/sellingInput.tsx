"use client"

import React, { useEffect, useState } from "react"
import { cn, useDebounce } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { MRT_Cell, MRT_Row } from "material-react-table"
import { Materials } from "@/types/uniwindata"

interface SellingInputProps {
  cell: MRT_Cell<Materials, unknown>
  row: MRT_Row<Materials>
  data: Materials[]
  setData: React.Dispatch<React.SetStateAction<Materials[]>>
}

const SellingInput = ({ cell, row, data, setData }: SellingInputProps) => {
  const [isModified, setIsModified] = useState(false)
  const [pulseGreen, setPulseGreen] = useState(false)
  const [sellingPrice, setSellingPrice] = useState(cell.getValue<number>())

  // The function called when the user changes the selling price after debouncing
  const updateMaterial = async (row: MRT_Row<Materials>) => {
    const code = row.original.code
    const sellingPrice = row.original.number5
    const margin = row.original.number3
    const buyingPrice = row.original.number4

    try {
      const response = await fetch(
        `https://genuine-calf-newly.ngrok-free.app/materials?code=${code}&sellingPrice=${sellingPrice}&margin=${margin}&buyingPrice=${buyingPrice}`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          },
        }
      )
      setIsModified(false)
      setPulseGreen(true)
    } catch (error) {
      console.error("Failed to update material: ", error)
    }
  }

  const debouncedSellingPrice = useDebounce(
    row,
    2000,
    updateMaterial,
    isModified
  )

  // Run the debounced only when the user modifies the selling price
  useEffect(() => {
    isModified && debouncedSellingPrice
  }, [sellingPrice])

  // Reset the pulse animation once it has been set to true after 1.5 seconds
  useEffect(() => {
    if (pulseGreen) {
      setTimeout(() => {
        setPulseGreen(false)
      }, 1500)
    }
  }, [pulseGreen])

  return (
    <Input
      className={cn(
        "w-20 no-spinners textRight",
        isModified ? "font-semibold animate-pulse border-2 border-red-500" : "",
        pulseGreen ? "animate-fadeOut-green border-2" : ""
      )}
      type="number"
      value={sellingPrice}
      onChange={(e) => {
        const newSellingPrice = parseFloat(e.target.value || "0")
        setSellingPrice(newSellingPrice)
        setIsModified(true)
        row.original.number5 = newSellingPrice
        row.original.number4 =
          Math.floor((newSellingPrice - row.original.number3) / 5) * 5 // toFloor nearest 5 pound
        setData([...data])
      }}
    />
  )
}

export default SellingInput
