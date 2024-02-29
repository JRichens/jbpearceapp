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

type Props = {
  customer: string
}

export function NewCustomerDrawer({ customer }: Props) {
  // React.useEffect(() => {
  //   console.log("passed Customer: ", customer)
  // }, [customer])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="ml-2"
          variant={"secondary"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>New Customer</DrawerTitle>
            <DrawerDescription>
              Create an account customer that will be invoiced
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <NewCustomerForm customer={customer} />
          </div>

          <DrawerFooter>
            <div className="flex flex-row items-center justify-evenly gap-x-2">
              <Button className="w-full">Submit</Button>
              <DrawerClose asChild>
                <Button
                  className="w-full"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
