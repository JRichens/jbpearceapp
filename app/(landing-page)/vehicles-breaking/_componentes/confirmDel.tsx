"use client"

import { useState } from "react"
import { DelBreakingVehicle } from "@/actions/del-breakingVehicle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  reg: string
}

export function ConfirmDel({ open, setOpen, reg }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleAction = async () => {
    setDeleting(true)
    await DelBreakingVehicle(reg)
    setDeleting(false)
    setOpen(false)
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-row gap-3 justify-end">
            <AlertDialogAction
              className="w-24"
              onClick={handleAction}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-24 mt-0"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
