"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PaidTickets } from "@/types/uniwindata"

import ReconcileCell from "./reconcile-cell"

export const columns: ColumnDef<PaidTickets>[] = [
  {
    accessorKey: "number17",
    header: "Date",
    cell: ({ cell }) => {
      const numDays = cell.getValue()

      // Make sure numDays is a valid number
      if (typeof numDays !== "number") return "Invalid Date"

      // Assuming numDays is the number of days since 1/1/1900
      let baseDate = new Date("01/01/1900")

      // JavaScript's setDate might not behave as expected if numDays is too large
      // Hence, convert numDays to milliseconds and add to baseDate's time
      const millisPerDay = 24 * 60 * 60 * 1000
      // Also deduct 2 days to get the correct date from numDays
      let targetDateInMillis = baseDate.getTime() + (numDays - 2) * millisPerDay

      let targetDate = new Date(targetDateInMillis)
      return (
        <div>
          {targetDate.getDate()}/{targetDate.getMonth() + 1}/
          {targetDate.getFullYear()}
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
      return (
        <div className="w-24">
          {(cell.getValue() as string).substring(0, 11)}
        </div>
      )
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
    accessorKey: "logical27",
    header: "Reconcile",
    cell: ({ cell }) => <ReconcileCell cell={cell} />,
  },
]
