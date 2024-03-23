"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Plus } from "lucide-react"
import NewCustomerForm from "./new-customer-form"
import { Separator } from "@/components/ui/separator"

type Props = {
  customer: string
  setOpenPopover: React.Dispatch<React.SetStateAction<boolean>>
  setValue: React.Dispatch<React.SetStateAction<string>>
}

export function NewCustomerDrawer({
  customer,
  setOpenPopover,
  setValue,
}: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer open={open}>
      <DrawerTrigger asChild>
        <Button
          className="ml-2"
          variant={"secondary"}
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4">
          <DrawerHeader>
            <DrawerTitle>Create New Customer</DrawerTitle>
            <Separator />
          </DrawerHeader>

          {/* The actual form the user enters data into */}
          <NewCustomerForm
            setOpen={setOpen}
            customer={customer}
            setOpenPopover={setOpenPopover}
            setValue={setValue}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
