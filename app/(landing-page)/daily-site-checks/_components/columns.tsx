"use client"

import { CompleteTask } from "@/actions/complete-task"

import { ColumnDef } from "@tanstack/react-table"

import { Task } from "@prisma/client"

import { Checkbox } from "@/components/ui/checkbox"
import CheckViewCell from "./description-cell"

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "checkDate",
    header: "Date Due",
    cell: ({ cell }) => {
      return <div className="min-w-[155px]">{cell.getValue() as string}</div>
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ cell }) => <CheckViewCell cell={cell} />,
  },
  {
    accessorKey: "completed",
    header: "Completed",
    cell: ({ cell }) => {
      return (
        <div className="ml-8">
          <Checkbox
            onCheckedChange={async (e) => {
              const trueFalse = e.valueOf().toString() === "true" ? true : false
              await CompleteTask(cell.row.original.id, trueFalse)
            }}
            defaultChecked={cell.getValue() as boolean}
          />
        </div>
      )
    },
  },
  {
    accessorKey: "completedAt",
    header: "Time Complete",
    cell: ({ cell }) => {
      // Convert the date string to a Date object
      let date = new Date(cell.getValue() as string)

      // Convert the date to a time string
      let timeString = date.toTimeString()

      // Remove the seconds and timezone information from the time string
      timeString = timeString.substring(0, 8)

      timeString === "01:00:00" ? (timeString = "") : (timeString = timeString)
      return timeString
    },
  },
  {
    accessorKey: "completedBy",
    header: "Completed By",
  },
]
