"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UnPaidTickets } from "@/types/uniwindata"
import { Checkbox } from "@/components/ui/checkbox"
import { useCallback, useEffect, useState, useTransition } from "react"
import { GetUser } from "@/actions/get-user"

export const columns: ColumnDef<UnPaidTickets>[] = [
  {
    accessorKey: "number17",
    header: "Date",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      let numDays = cell.getValue() as number
      let millisPerDay = 24 * 60 * 60 * 1000
      let dateInMilliSec = (numDays - 1) * millisPerDay
      let date = new Date(dateInMilliSec)
      return (
        <div>
          {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear() - 70}
        </div>
      )
    },
  },
  {
    accessorKey: "ticket2",
    header: "Ticket",
    cell: ({ cell }) => {
      return <div className="text-center">{cell.getValue() as string}</div>
    },
  },
  {
    accessorKey: "string9",
    header: "Supplier Name",
  },
  {
    accessorKey: "string8",
    header: "SortCode",
  },
  {
    accessorKey: "string7",
    header: "AccountNo",
  },
  {
    accessorKey: "string4",
    header: "Payment Type",
    cell: ({ cell }) => {
      // check logical22 ticked or not to show BACS or TRADING ACC
      let logical22 = cell.row.getValue("logical22")
      useEffect(() => {
        logical22 = cell.row.getValue("logical22")
      }, [])
      if (cell.row.getValue("logical22") === "1") {
        return <div className="text-center">TRADING ACC</div>
      } else {
        return <div className="text-center">BACS</div>
      }
    },
  },
  {
    accessorKey: "number16",
    header: "VAT",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      let gbpFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      })
      return (
        <div className="text-right text-slate-950 w-full">
          {gbpFormatter.format(cell.getValue() as number)}
        </div>
      )
    },
  },
  {
    accessorKey: "number6",
    header: "Payable",
    cell: ({ cell }) => {
      if (typeof cell.getValue() !== "number") return
      let gbpFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      })
      return (
        <div className="text-right text-slate-950 w-full">
          {gbpFormatter.format(cell.getValue() as number)}
        </div>
      )
    },
  },
  {
    accessorKey: "logical22",
    header: "Paid",
    cell: ({ cell }) => {
      const [checked, setChecked] = useState(false)
      const [isPending, startTransition] = useTransition()

      const updatePaidState = useCallback(async (checked: boolean) => {
        const today = Math.floor(
          (new Date().getTime() - new Date(1899, 11, 30).getTime()) / 86400000
        ).toString()
        const ticketNo = cell.row.getValue("ticket2")

        try {
          const user = await GetUser()
          await fetch(
            `https://genuine-calf-newly.ngrok-free.app/unPaidTickets?ticketNo=${ticketNo}&paid=${
              checked ? 1 : 0
            }&initials=${user?.initials}&date=${today}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          console.log("Updated the paid state on ticket: ", ticketNo)
        } catch (error) {
          console.error("Failed to update paid state: ", error)
        }
      }, [])

      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={checked}
            onCheckedChange={() => {
              startTransition(() => {
                const newChecked = !checked
                setChecked(newChecked)
                updatePaidState(newChecked)
              })
            }}
            disabled={isPending}
          />
        </div>
      )
    },
  },
]
