"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_Cell,
} from "material-react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

type Materials = {
  code: string
  string24: string
  number4: number
  number5: number
  number3: number
}

type MaterialsWithId = {
  id: number
  code: string
  string24: string
  number4: number
  number5: number
  number3: number
}

type Props = {
  passedData: Materials[]
}

const MaterialsComponent = ({ passedData }: Props) => {
  // first asign a number id to each Material in the passedData
  const dataWithIds: MaterialsWithId[] = passedData.map((material, index) => ({
    ...material,
    id: index,
  }))

  const [data, setData] = useState<MaterialsWithId[]>(dataWithIds)
  const [sellingChanging, setSellingChanging] = useState(false)

  const columns = useMemo<MRT_ColumnDef<Materials>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        size: 20,
      },
      {
        header: "Code",
        accessorKey: "code",
        size: 30,
      },
      {
        header: "Description",
        accessorKey: "string24",
      },
      {
        header: "Selling",
        accessorKey: "number5",
        size: 30,
        Cell: ({ cell, row }) => (
          <div className="flex gap-2">
            <Input
              className="w-20 no-spinners textRight"
              type="number"
              value={cell.getValue<number>()}
              onChange={(e) => {
                setSellingChanging(true)
                const newSellingPrice = parseFloat(e.target.value || "0")
                row.original.number5 = newSellingPrice
                row.original.number4 =
                  Math.floor((newSellingPrice - row.original.number3) / 5) * 5 // toFloor nearest 5 pound
                setData([...data])
              }}
            />
          </div>
        ),
      },
      {
        header: "Margin",
        accessorKey: "number3",
        size: 30,
        Cell: ({ cell, row }) => (
          <Input
            className="w-20 no-spinners textRight"
            type="number"
            value={cell.getValue<number>()}
            onChange={(e) => {
              const newMargin = parseInt(e.target.value)
              row.original.number3 = newMargin
              row.original.number4 =
                Math.floor((row.original.number5 - newMargin) / 5) * 5 // toFloor nearest 5 pound
              setData([...data])
            }}
          />
        ),
      },
      {
        header: "Buying",
        accessorKey: "number4",
        size: 30,
        Cell: ({ cell }) => (
          <div className="w-20 textRight">
            {cell.getValue<number>().toLocaleString()}
          </div>
        ),
      },
    ],
    [data]
  )

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        initialState={{
          density: "compact",
          pagination: { pageIndex: 0, pageSize: 100 },
        }}
      />
    </>
  )
}

export default MaterialsComponent
