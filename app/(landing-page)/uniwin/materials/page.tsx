"use client"

import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { columns } from "./_components/columns"
import { printColumns } from "./_components/printColumns"
import { DataTable } from "./_components/data-table"
import { NavMenu } from "../nav-menu"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import ReactToPrint from "react-to-print"
import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"

import { Materials } from "@/types/uniwindata"

const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json())

const MaterialsPage = () => {
  const { data, error } = useSWR<Materials[]>(
    "https://genuine-calf-newly.ngrok-free.app/materials",
    fetcher
  )

  const ComponentToPrint = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref}>
      <DataTable
        columns={printColumns}
        data={data ? data : []}
      />
    </div>
  ))

  const componentRef = useRef<HTMLDivElement>(null)

  return (
    <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
      <div className="pl-2">
        <NavMenu />
      </div>
      <Separator />
      <CardHeader>
        <CardTitle>Materials File</CardTitle>
        <CardDescription>
          Adjust selling prices here to automatically calculate paying value
        </CardDescription>
        <div>
          <ReactToPrint
            trigger={() => (
              <Button variant="outline">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
            content={() => componentRef.current}
            pageStyle={`@page {size: 210mm 297mm; margin: 30;}`}
          />
          <div style={{ display: "none" }}>
            <ComponentToPrint ref={componentRef} />
          </div>
        </div>
      </CardHeader>
      <div className="px-4 md:px-6 pb-3">
        <ScrollArea>
          <DataTable
            columns={columns}
            data={data ? data : []}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  )
}

export default MaterialsPage
