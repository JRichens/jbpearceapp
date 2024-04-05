"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Form } from "../../_components/reg-form"
import { Car } from "@prisma/client"
import { useEffect, useState } from "react"
import CarBox from "./carBox"
import { AddExportVehicle } from "@/actions/add-exportVehicle"
import { Loader2 } from "lucide-react"

type Props = {
  newVehicleDialog: boolean
  setNewVehicleDialog: React.Dispatch<React.SetStateAction<boolean>>
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
}

const NewVehicleDialog = ({
  newVehicleDialog,
  setNewVehicleDialog,
  search,
  setSearch,
}: Props) => {
  const [vehicle, setVehicle] = useState<Car | null>(null)
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (vehicle) {
      setAdding(true)
      const result = await AddExportVehicle(vehicle.reg)
      setAdding(false)
      setVehicle(null)
      setSearch("")
      result && setNewVehicleDialog(false)
    }
  }

  return (
    <>
      <Dialog
        open={newVehicleDialog}
        onOpenChange={setNewVehicleDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Vehicle For Export</DialogTitle>
            <DialogDescription>
              Add the vehicle reg and 2 photos
            </DialogDescription>
          </DialogHeader>

          <Separator className="" />
          <Form
            setVehicle={setVehicle}
            search={search}
          />

          <CarBox vehicle={vehicle} />
          <DialogFooter>
            <div className="flex flex-row gap-3 items-center ">
              <Button
                onClick={handleAdd}
                className="min-w-[100px] flex flex-grow bg-gold hover:bg-darkgold"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                className="min-w-[100px] flex flex-grow"
                onClick={() => {
                  setNewVehicleDialog(false)
                }}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewVehicleDialog
