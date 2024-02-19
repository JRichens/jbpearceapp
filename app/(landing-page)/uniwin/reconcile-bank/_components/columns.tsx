"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PaidTickets } from "@/types/uniwindata"
import { Checkbox } from "@/components/ui/checkbox"

import ReconcileCell from "./reconcile-cell"

import { useState, useTransition } from "react"

export const columns: ColumnDef<PaidTickets>[] = [
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
