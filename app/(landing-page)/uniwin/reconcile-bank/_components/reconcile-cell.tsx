// ReconcileCell.tsx
import React, { useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface ReconcileCellProps {
  cell: any // You might want to use a more specific type based on your data
}

const ReconcileCell: React.FC<ReconcileCellProps> = ({ cell }) => {
  const [reconcileIsPending, startSetReconcileTransition] = useTransition()
  const [reconcileStatus, setReconcileStatus] = useState(0)

  const ticketNo = cell.row.original.ticket2
  const defaultValue = cell.getValue() === "1"

  const updateReconcileState = async () => {
    const newReconcileStatus = reconcileStatus === 0 ? 1 : 0
    setReconcileStatus(newReconcileStatus)
    startSetReconcileTransition(async () => {
      try {
        const response = await fetch(
          `https://genuine-calf-newly.ngrok-free.app/paidTickets?ticketNo=${ticketNo}&reconcile=${newReconcileStatus}`,
          {
            method: "PUT",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )
        const data = await response.json()
      } catch (error) {
        console.error("Failed to update reconcile status: ", error)
      }
    })
  }

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        defaultChecked={defaultValue}
        disabled={reconcileIsPending}
        onCheckedChange={updateReconcileState}
      />
    </div>
  )
}

export default ReconcileCell
