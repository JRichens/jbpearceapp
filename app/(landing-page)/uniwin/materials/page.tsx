"use client"

import React, { useEffect, useRef } from "react"
import useSWR from "swr"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { printColumns } from "./_components/printColumns"
import { DataTable } from "./_components/data-table"
import { NavMenu } from "../nav-menu"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import ReactToPrint from "react-to-print"
import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"

import { Materials } from "@/types/uniwindata"
import MaterialsComponent from "./table"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json())

const MaterialsPage = () => {
  const { data, isLoading, error } = useSWR<Materials[]>(
    "https://genuine-calf-newly.ngrok-free.app/materials",
    fetcher
  )

  const [tableData, setTableData] = React.useState<Materials[]>([])

  useEffect(() => {
    if (data) setTableData(data)
  }, [data])

  const ComponentToPrint = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref}>
      <DataTable
        columns={printColumns}
        data={tableData}
      />
    </div>
  ))

  ComponentToPrint.displayName = "ComponentToPrint"

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
      <div className="px-6 pb-6">
        {error && <div>failed to load</div>}
        {isLoading && (
          <div className="flex flex-col gap-2 border border-slate-200 rounded-md shadow-sm p-4">
            <div className="flex flex-row gap-4">
              <Skeleton className="w-[25%] h-10 rounded-md" />
              <Skeleton className="w-[40%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
            </div>
            <div className="flex flex-row gap-4">
              <Skeleton className="w-[25%] h-10 rounded-md" />
              <Skeleton className="w-[40%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
            </div>
            <div className="flex flex-row gap-4">
              <Skeleton className="w-[25%] h-10 rounded-md" />
              <Skeleton className="w-[40%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
              <Skeleton className="w-[10%] h-10 rounded-md" />
            </div>
          </div>
        )}
        {data && (
          <MaterialsComponent
            tableData={tableData}
            setTableData={setTableData}
          />
        )}
      </div>
    </Card>
  )
}

export default MaterialsPage
