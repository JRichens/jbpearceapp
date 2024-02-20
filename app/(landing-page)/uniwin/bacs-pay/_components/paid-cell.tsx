import React, { useState, useTransition, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { GetUser } from "@/actions/get-user"

interface PaidCellProps {
  cell: any // Consider defining a more precise type based on your data structure
}

const PaidCell: React.FC<PaidCellProps> = ({ cell }) => {
  const [checked, setChecked] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const updatePaidState = useCallback(
    async (isChecked: boolean) => {
      // Convert current date to Excel date format
      const today = Math.floor(
        (new Date().getTime() - new Date(1899, 11, 30).getTime()) / 86400000
      ).toString()
      const ticketNo = cell.row.getValue("ticket2")

      const user = await GetUser()
      try {
        await fetch(
          `https://genuine-calf-newly.ngrok-free.app/unPaidTickets?ticketNo=${ticketNo}&paid=${
            isChecked ? 1 : 0
          }&initials=${user?.initials}&date=${today}&bank=BACS`,
          {
            method: "PUT",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )
        console.log("Updated the paid state on ticket: ", ticketNo)
      } catch (error) {
        console.error("Failed to update paid state: ", error)
      }
    },
    [cell]
  )

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
}

export default PaidCell
