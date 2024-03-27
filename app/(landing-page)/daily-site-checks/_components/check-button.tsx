"use client"

import { useState } from "react"

import { CheckView } from "./check-popup"

import { Button } from "@/components/ui/button"

type Props = {
  cellDescription: string
}

export default function CheckButton({ cellDescription }: Props) {
  const [dialogStatus, setDialogStatus] = useState<boolean>(false)

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => setDialogStatus(!dialogStatus)}
      >
        View Check
      </Button>
      {dialogStatus && (
        <CheckView
          checkDesc={cellDescription}
          setDialogStatus={setDialogStatus}
        />
      )}
    </>
  )
}
