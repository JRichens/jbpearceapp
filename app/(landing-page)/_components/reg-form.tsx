"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react"

import getCarDetailsAsJSON from "@/lib/vehicleapi"

import { Car } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export const Form = ({
  setVehicle,
  search,
}: {
  setVehicle: Dispatch<SetStateAction<Car | null>>
  search?: string
}) => {
  const [reg, setReg] = useState(search ? search : "")
  const [pending, setPending] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setPending(true)
    console.log("set pending, reg:", reg)

    try {
      console.log("getting vehicle data")
      const vehicleData: Car | null = await getCarDetailsAsJSON(reg)
      console.log("got vehicleData")
      console.log("This is our vehicle:", vehicleData)

      if (!vehicleData) {
        toast({
          title: "Could not find vehicle",
          description: "Please check the registration is correct",
          variant: "destructive",
        })
        setVehicle && setVehicle(null)

        return
      } else {
        setVehicle && setVehicle(vehicleData)
      }
      setReg("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mt-1.5">
        <Input
          id="reg"
          name="reg"
          required
          value={reg}
          autoFocus
          placeholder="Registration.."
          onKeyDown={(event) => {
            if (event.key === " ") {
              event.preventDefault()
            }
          }}
          onChange={(e) => setReg(e.target.value.toUpperCase())}
          className="text-xl max-w-[150px]"
        />
        <Button
          type="submit"
          disabled={pending}
          className="w-20"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </form>
  )
}
