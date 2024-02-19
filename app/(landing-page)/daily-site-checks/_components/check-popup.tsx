"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import TipTapEditor from "@/components/TipTapEditor"

import { useEffect, useState, useTransition } from "react"
import { GetTaskDetails } from "@/actions/get-task-details"

import { ThreeCircles } from "react-loader-spinner"

type Props = {
  checkDesc: string
}

export function CheckView({ checkDesc }: Props) {
  const [isPending, startTransition] = useTransition()
  const [checkDetails, setCheckDetails] = useState("")

  useEffect(() => {
    const getCheckDetails = async () => {
      startTransition(async () => {
        const checkDetails = await GetTaskDetails(checkDesc)
        checkDetails && setCheckDetails(checkDetails)
      })
    }
    getCheckDetails()
  }, [checkDesc])

  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px]">
        <ScrollArea className="">
          <DialogHeader>
            <DialogTitle className="text-3xl">Daily {checkDesc}</DialogTitle>
          </DialogHeader>
          <Separator className="my-4" />
          {isPending ? (
            <div className="w-full h-full flex items-center justify-center">
              <ThreeCircles color="#d3c22a" />
            </div>
          ) : (
            <TipTapEditor initialContent={checkDetails} />
          )}

          <DialogFooter>
            <DialogTrigger className="absolute bottom-2 right-4">
              <Button>Close</Button>
            </DialogTrigger>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
