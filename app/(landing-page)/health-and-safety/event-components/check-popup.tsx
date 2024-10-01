"use client"

import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import TipTapEditor from "@/components/TipTapEditor"

import { GetTaskDetails } from "@/actions/get-task-details"

import { ThreeCircles } from "react-loader-spinner"

type Props = {
  checkDesc: string
  setDialogStatus: React.Dispatch<React.SetStateAction<boolean>>
}

export function CheckView({ checkDesc, setDialogStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [checkDetails, setCheckDetails] = useState("")

  useEffect(() => {
    startTransition(async () => {
      try {
        const details = await GetTaskDetails(checkDesc)
        if (details) {
          setCheckDetails(details)
        }
      } catch (error) {
        console.error("Failed to fetch check details:", error)
        // Handle error (e.g., set an error state, show a toast message, etc.)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px]">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle className="text-3xl">Daily {checkDesc}</DialogTitle>
          </DialogHeader>
          <Separator className="my-4" />
          {isPending ? (
            <div className="w-full h-full flex items-center justify-center">
              <ThreeCircles color="#d3c22a" />
            </div>
          ) : (
            checkDetails && <TipTapEditor initialContent={checkDetails} />
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setDialogStatus(false)
              }}
              className="absolute bottom-2 right-4"
            >
              Close
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
