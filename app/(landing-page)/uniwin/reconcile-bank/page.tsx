"use client"

import { useEffect, useState, useTransition } from "react"

import axios from "axios"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PaidTickets } from "@/types/uniwindata"
import { columns } from "./_components/columns"
import { DataTable } from "./_components/data-table"
import { NavMenu } from "../materials/_components/nav-menu"
import { Separator } from "@/components/ui/separator"
import { ThreeCircles } from "react-loader-spinner"

import * as React from "react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarDays, PrinterIcon } from "lucide-react"
import ReactToPrint from "react-to-print"
import { DataTablePrint } from "./_components/print-data-table"

const ReconcileBank = () => {
  class ComponentToPrint extends React.Component {
    render() {
      return (
        <div className="flex flex-col">
          <div className="flex flex-row">
            <div className="px-2 flex items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
              <span>From: {date?.from && format(date.from, "dd/MM/yyyy")}</span>
              <span>To: {date?.to && format(date.to, "dd/MM/yyyy")}</span>
            </div>
            <div className="px-2 flex items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
              Total Payable: {totalPayable}
            </div>
          </div>

          <DataTablePrint
            columns={columns}
            data={paidTickets}
          />
        </div>
      )
    }
  }

  const [paidTickets, setPaidTickets] = useState<PaidTickets[]>([])
  const [totalPayable, setTotalPayable] = useState("")
  const [isPending, startTransition] = useTransition()

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  useEffect(() => {
    const getTickets = async () => {
      startTransition(async () => {
        // Convert the dates to number of days past 31/12/1899
        const from =
          date?.from &&
          Math.floor(
            (date.from.getTime() - new Date(1899, 11, 30).getTime()) / 86400000
          )
        const to =
          date?.to &&
          Math.floor(
            (date.to.getTime() - new Date(1899, 11, 30).getTime()) / 86400000
          )

        try {
          const res = await fetch(
            "https://genuine-calf-newly.ngrok-free.app/paidTickets?from=" +
              from +
              "&to=" +
              to,
            {
              method: "GET",
              headers: {
                "ngrok-skip-browser-warning": "69420",
                "Content-Type": "application/json",
              },
            }
          )
          const data = await res.json()

          setPaidTickets(data)
        } catch (error) {}

        try {
          const res = await fetch(
            "https://genuine-calf-newly.ngrok-free.app/paidTickets?from=" +
              from +
              "&to=" +
              to +
              "&total=true",
            {
              method: "GET",
              headers: {
                "ngrok-skip-browser-warning": "69420",
                "Content-Type": "application/json",
              },
            }
          )
          const total = await res.json()
          // Format the total to a monetary value in GBP pounds
          const formatter = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
          })

          const totalFormatted = formatter.format(total)

          setTotalPayable(totalFormatted)
        } catch (error) {}
      })
    }
    getTickets()
  }, [date])

  const componentRef = React.useRef<ComponentToPrint | null>(null)

  return (
    <>
      <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
        <div className="pl-2">
          <NavMenu />
        </div>

        <Separator />
        <CardHeader>
          <CardTitle>Reconcile Bank</CardTitle>
          <CardDescription>
            Reconcile all paid bank transfers then refresh to filter out
            reconciled tickets
          </CardDescription>
        </CardHeader>

        <div className="px-4 md:px-6 pb-3">
          <div className="flex flex-row gap-2 pb-2">
            {/* Date Picker with Range */}
            <div className={cn("grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      " justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Print Button */}
            <ReactToPrint
              trigger={() => (
                <Button variant={"outline"}>
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </Button>
              )}
              content={() => componentRef.current}
              pageStyle={`@page {size: 297mm 210mm; margin: 30;}`}
            />
            <div style={{ display: "none" }}>
              <ComponentToPrint
                ref={(el) => {
                  if (el) {
                    componentRef.current = el
                  }
                }}
              />
            </div>
            <div className="px-2 flex items-center justify-center border-solid border-[1px] border-slate-200 rounded-md">
              Total Payable: {totalPayable}
            </div>
          </div>

          <ScrollArea className="">
            {isPending ? (
              <div className="w-full h-full flex items-center justify-center">
                <ThreeCircles color="#d3c22a" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={paidTickets}
              />
            )}

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Card>
    </>
  )
}

export default ReconcileBank
