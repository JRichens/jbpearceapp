"use client"

import { useState } from "react"

import { Car } from "@prisma/client"

import { addToExport } from "@/actions/add-to-export"

import { Separator } from "@/components/ui/separator"
import { Form } from "../_components/reg-form"
import { Button } from "@/components/ui/button"

const EbayVehicleSearch = () => {
  const [vehicle, setVehicle] = useState<Car | null>(null)

  const openEbayUrl = () => {
    //https://www.ebay.co.uk/sch/6030/i.html?_nkw=FORD+KUGA+MK1+2009&LH_ItemCondition=3000&rt=nc&LH_Sold=1&LH_Complete=1
    const url = `https://www.ebay.co.uk/sch/6030/i.html?_nkw=${
      vehicle?.dvlaMake
    }+${vehicle?.dvlaModel?.split(" ")[0]}+${
      vehicle?.modelSeries?.split(" ")[0]
    }+${
      vehicle?.dvlaYearOfManufacture
    }&&LH_ItemCondition=3000&rt=nc&LH_Sold=1&LH_Complete=1`
    window.open(url, "_blank")
  }

  return (
    <div className="max-w-2xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
      <h1 className="font-bold text-2xl">eBay Vehicle Search</h1>
      <p>Search for parts & accessories related to your vehicle by value</p>
      <Separator className="mt-2 mb-6" />
      <Form setVehicle={setVehicle} />
      {vehicle?.vinOriginalDvla && (
        <div className="mt-4">
          <span>
            {vehicle.dvlaMake} / {vehicle.dvlaModel} /{" "}
            {vehicle.dvlaYearOfManufacture} / {vehicle.modelSeries}
          </span>
          <p>
            Will Search: {vehicle.dvlaMake} {vehicle.dvlaModel?.split(" ")[0]}{" "}
            {vehicle.modelSeries?.split(" ")[0]} {vehicle.dvlaYearOfManufacture}
          </p>
          <p>Reg: {vehicle.reg}</p>
          <div className="flex flex-col w-32">
            <Button
              onClick={openEbayUrl}
              className="mt-4"
            >
              Open on eBay
            </Button>
            <Button
              onClick={() => addToExport(vehicle?.reg)}
              className="mt-4"
            >
              Add to Export
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
export default EbayVehicleSearch
