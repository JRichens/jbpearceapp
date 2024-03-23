import Image from "next/image"

import { Car } from "@prisma/client"
import { cn } from "@/lib/utils"

type Props = {
  vehicle: Car | null
}

const CarBox = ({ vehicle }: Props) => {
  return (
    <>
      {vehicle && (
        <div className="flex flex-col items-center w-[300px] min-h-[120px] border border-slate-200 p-1 rounded-md shadow-sm cursor-pointer hover:shadow-md">
          <div className="flex items-center justify-center m-2 mb-3">
            <div className="relative">
              <input
                type="text"
                className={cn(
                  "text-center",
                  "rounded-lg",
                  "w-[285px]",
                  "h-[60px]",
                  "pl-10",
                  "pr-2",
                  "text-5xl",
                  "font-bold",
                  "text-black",
                  "uppercase",
                  "border-2",
                  "border-slate-500",
                  "outline-none",
                  "font-charles-wright",
                  "pt-3",
                  "sm:pt-0"
                )}
                defaultValue={vehicle.reg}
              />

              <div className="flex flex-col items-center justify-center rounded-l-lg absolute top-0 left-0 w-8 h-[60px]  text-sm font-bold text-white bg-blue-600 ">
                <img
                  src="/Flag_of_the_United_Kingdom.svg"
                  className="p-1"
                  alt="Flag of the United Kingdom"
                />
                <p>UK</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <Image
              src={`https://ws.carwebuk.com${vehicle.imageUrl}`}
              width={140}
              height={140}
              alt=""
            />
            <Image
              src={`https://ws.carwebuk.com${vehicle.imageUrl}`}
              width={140}
              height={140}
              style={{
                transform: "scaleX(-1)",
              }}
              alt=""
            />
          </div>
          <div className="flex flex-col">
            <p className="font-medium">
              {vehicle.dvlaMake}{" "}
              {vehicle.dvlaModel?.split(" ").slice(0, 2).join(" ")}
            </p>
            <p>
              {vehicle.nomCC?.includes(".")
                ? vehicle.nomCC
                : `${vehicle.nomCC}.0`}{" "}
              {vehicle.fuelType}{" "}
              {vehicle.transmission?.includes("AUTOMATIC")
                ? "AUTO"
                : vehicle.transmission}
              {" - "}
              {vehicle.dvlaYearOfManufacture}
              {" ("}
              {vehicle.modelSeries?.split(" ")[0]}
              {")"}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default CarBox
