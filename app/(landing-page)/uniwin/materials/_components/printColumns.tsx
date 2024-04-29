"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Materials } from "@/types/uniwindata"

export const printColumns: ColumnDef<Materials>[] = [
  {
    accessorKey: "string24",
    header: "Description",
    cell: ({ cell }) => {
      return (
        <div className="w-[160px] py-1 -my-2">
          <span className="w-20 text-slate-950 text-md">
            {cell.getValue() as number}
          </span>
        </div>
      )
    },
  },
  {
    id: "calculatedColumn",
    header: "Paying kg",
    cell: ({ row }) => {
      const number4Value = row.getValue("number4")
      if (typeof number4Value !== "number") return null

      // Perform your calculation based on number4 value
      const calculatedValue = (number4Value / 1000).toFixed(2)

      return (
        <div className="w-12 py-1 -my-[6px]">
          <span className="text-slate-950 text-md">{calculatedValue}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "number4",
    header: "Paying tonne",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      return (
        <div className="w-16 text-right py-1 -my-[6px]">
          <span className="text-slate-950 text-md">
            {cell.getValue() as number}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "number5",
    header: "Selling",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      return (
        <div className="w-12 text-right py-1 -my-[6px]">
          <span className="text-slate-950 text-md">
            {cell.getValue() as number}
          </span>
        </div>
      )
    },
  },
  {
    id: "calculatedColumn2",
    header: "",
    cell: ({ row }) => {
      return <div className="w-[185px] text-right py-1 -my-[6px]"></div>
    },
  },
]
