"use client"

import { useEffect, useState } from "react"
import { GetWeight } from "@/actions/get-weight"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const WeighbridgeDisplay = () => {
  const [latestWeight, setLatestWeight] = useState("")
  const [stableMoving, setStableMoving] = useState("")

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Call the server action to fetch the latest weight
        const data = await GetWeight()
        setLatestWeight(data.weight)
        setStableMoving(data.stable ? "S" : "M")
      } catch (error) {
        console.error("Failed to fetch latest weight", error)
      }
    }, 750) // Fetch every half second

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-xs mx-auto flex flex-col items-center">
      <div>
        <Input
          className={cn(
            "w-40 h-16 bg-slate-900 weightDisplay text-5xl text-right text-green-400 pb-3"
          )}
          value={latestWeight}
          readOnly
        />
        <p
          className={cn(
            "font-bold absolute top-10 pl-2",
            stableMoving === "S" ? "text-green-400" : "text-red-500"
          )}
        >
          {stableMoving === "S" ? "STABLE" : "MOVING"}
        </p>
      </div>
      <div className="mt-3 flex flex-row gap-x-2">
        <Input
          className="text-2xl"
          placeholder="Notes..."
        />
        <Button className="text-lg bg-gold text-white">Save</Button>
      </div>
    </div>
  )
}

export default WeighbridgeDisplay
