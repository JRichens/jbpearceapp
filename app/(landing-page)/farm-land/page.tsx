"use client"

import { useState, useEffect } from "react"
import GoogleMapsFarm from "@/components/maps/GoogleMapsFarm"
import { Feature, FeatureCollection } from "@/types/land-area"
import { UpdateLandAreaSTid } from "@/actions/farmLandArea"

const FarmLandAreas = () => {
  // const [data, setData] = useState<FeatureCollection | null>(null)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("/data.json")
  //       const jsonData: FeatureCollection = await response.json()
  //       setData(jsonData)

  //       jsonData.features.forEach((feature: Feature) => {
  //         UpdateLandAreaSTid(
  //           feature.id,
  //           feature.properties.SHEET_ID,
  //           feature.properties.PARCEL_ID
  //         )
  //       })
  //     } catch (error) {
  //       console.error("Error fetching data:", error)
  //     }
  //   }

  //   fetchData()
  // }, [])

  return (
    <section className="h-full -mt-6 -mb-16">
      <GoogleMapsFarm />
      {/* {data?.features.map((feature: Feature) => (
        <div
          key={feature.id}
          className="flex flex-col items-center w-[300px] min-h-[60px] border bg-white border-slate-200 rounded-md shadow-sm cursor-pointer hover:shadow-md p-2 mb-2 ml-2"
        >
          <p>featureId: {feature.id}</p>
          <p>
            ST No:{" "}
            {feature.properties.SHEET_ID + " " + feature.properties.PARCEL_ID}
          </p>
        </div>
      ))} */}
    </section>
  )
}

export default FarmLandAreas
