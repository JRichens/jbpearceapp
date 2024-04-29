"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Materials } from "@/types/uniwindata"
import { Input } from "@/components/ui/input"

export const columns: ColumnDef<Materials>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "string24",
    header: "Description",
  },

  {
    accessorKey: "number5",
    header: "Selling",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      return (
        <>
          <div className="absolute text-lg pt-[5px] pl-2 pr-1 pb-[7px] border-r-[1px]">
            £
          </div>
          <Input
            defaultValue={cell.getValue() as number}
            className="w-20 text-right text-slate-950"
          />
        </>
      )
    },
  },
  {
    accessorKey: "number3",
    header: "Margin",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      return (
        <>
          <div className="absolute text-lg pt-[5px] pl-2 pr-1 pb-[7px] border-r-[1px]">
            £
          </div>
          <Input
            defaultValue={cell.getValue() as number}
            className="w-20 text-right text-slate-950"
          />
        </>
      )
    },
  },
  {
    id: "paying",
    header: "Paying",
    cell: ({ row }) => {
      const selling = row.getValue("number5")
      const margin = row.getValue("number3")
      if (typeof selling !== "number" || typeof margin !== "number") return
      const paying = Math.floor((selling - margin) / 5) * 5
      return (
        <>
          <div className="absolute text-lg pt-[5px] pl-2 pr-1 pb-[7px] border-r-[1px]">
            £
          </div>
          <Input
            value={paying}
            readOnly
            className="w-20 text-right text-slate-950"
          />
        </>
      )
    },
  },
]
