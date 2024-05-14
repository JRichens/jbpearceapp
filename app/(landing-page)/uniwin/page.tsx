"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NavMenu } from "./nav-menu"
import { Separator } from "@/components/ui/separator"

import React, {
  PureComponent,
  startTransition,
  useEffect,
  useState,
} from "react"
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface WeeklyData {
  weeklyTotals: WeeklyTotal[]
  weeklyProfits: WeeklyProfit[]
}

interface WeeklyTotal {
  day_of_week: string
  Avg: number
  Live: number
}

interface WeeklyProfit {
  day_of_week: string
  Paid: number
  Profit: number
}

const DailyTotalBars = ({ data }: { data: WeeklyTotal[] }) => {
  return (
    <>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day_of_week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Avg"
          fill="#8884d8"
        />
        <Bar
          dataKey="Live"
          fill="#D1C028"
        />
      </BarChart>
    </>
  )
}

const DailyProfitBars = ({ data }: { data: WeeklyProfit[] }) => {
  return (
    <>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day_of_week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Avg"
          fill="#8884d8"
        />
        <Bar
          dataKey="Profit"
          fill="#D1C028"
        />
      </BarChart>
    </>
  )
}

const UniWin = () => {
  const [prevWeekTotals, setPrevWeekTotals] = useState<WeeklyData>({
    weeklyTotals: [],
    weeklyProfits: [],
  })
  const [currWeekTotals, setCurrWeekTotals] = useState<WeeklyData>({
    weeklyTotals: [],
    weeklyProfits: [],
  })

  useEffect(() => {
    const getWeeklyTotals = async () => {
      try {
        // Get the current date
        const today = new Date()

        // Calculate the date for the previous Monday
        const prevMonday = new Date(today)
        prevMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7)
        // Get the days since '1899-12-30'
        const prevMonDaysSince = Math.floor(
          (prevMonday.getTime() - new Date(1899, 11, 30).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Calculate the date for the previous Sunday
        const prevSunday = new Date(prevMonday)
        prevSunday.setDate(prevMonday.getDate() + 6)
        const prevSunDaysSince = Math.floor(
          (prevSunday.getTime() - new Date(1899, 11, 30).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Calculate the date for the current Monday
        const currMonday = new Date(today)
        currMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
        // Get the days since '1899-12-30'
        const currMonDaysSince = Math.floor(
          (currMonday.getTime() - new Date(1899, 11, 30).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Calculate the date for the current Sunday
        const currSunday = new Date(currMonday)
        currSunday.setDate(currMonday.getDate() + 6)
        const currSunDaysSince = Math.floor(
          (currSunday.getTime() - new Date(1899, 11, 30).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Format the dates as "YYYY-MM-DD"
        const prevWeekFrom = prevMonday.toISOString().split("T")[0]
        const prevWeekTo = prevSunday.toISOString().split("T")[0]
        const currWeekFrom = currMonday.toISOString().split("T")[0]
        const currWeekTo = currSunday.toISOString().split("T")[0]

        // Log out all the dates
        // console.log("Previous week from:", prevWeekFrom)
        // console.log("Previous week to:", prevWeekTo)
        // console.log("Current week from:", currWeekFrom)
        // console.log("Current week to:", currWeekTo)
        // console.log("prevMonDaysSince:", prevMonDaysSince)
        // console.log("prevSunDaysSince:", prevSunDaysSince)
        // console.log("currMonDaysSince:", currMonDaysSince)
        // console.log("currSunDaysSince:", currSunDaysSince)

        // Fetch data for the previous week
        const prevWeekRes = await fetch(
          `https://genuine-calf-newly.ngrok-free.app/weeklyTotals?from=${prevWeekFrom}&to=${prevWeekTo}&numfrom=${prevMonDaysSince}&numto=${prevSunDaysSince}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )

        const prevWeekData: WeeklyData = await prevWeekRes.json()
        // console.log("prevWeekData", prevWeekData)
        setPrevWeekTotals(prevWeekData)

        // Fetch data for the current week
        const currWeekRes = await fetch(
          `https://genuine-calf-newly.ngrok-free.app/weeklyTotals?from=${currWeekFrom}&to=${currWeekTo}&numfrom=${currMonDaysSince}&numto=${currSunDaysSince}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )
        const currWeekData: WeeklyData = await currWeekRes.json()
        console.log("currWeekData", currWeekData)
        setCurrWeekTotals(currWeekData)
      } catch (error) {}
    }
    getWeeklyTotals()
  }, [])

  return (
    <>
      <Card className="max-w-5xl w-[92vw] mx-[3vw] mb-4">
        <div className="pl-2">
          <NavMenu />
        </div>

        <Separator />
        <CardHeader>
          <CardTitle>UniWin Data</CardTitle>
          <CardDescription>
            Pick from the drop downs what you require. All data can be retrieved
            here.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-row flex-wrap mx-[3vw] gap-4">
        <Card className="w-[520px] h-auto">
          <CardHeader>
            <CardTitle>This Week Total Tickets</CardTitle>
            <CardDescription>
              Compare this weeks daily total transactions against the 2023
              averages
            </CardDescription>
          </CardHeader>
          <DailyTotalBars data={currWeekTotals.weeklyTotals} />
        </Card>
        <Card className="w-[520px] h-auto">
          <CardHeader>
            <CardTitle>Last Week Total Tickets</CardTitle>
            <CardDescription>
              Compare last weeks daily total transactions against the 2023
              averages
            </CardDescription>
          </CardHeader>
          <DailyTotalBars data={prevWeekTotals.weeklyTotals} />
        </Card>
        <Card className="w-[520px] h-auto">
          <CardHeader>
            <CardTitle>This Week Total Est. Gross Profit</CardTitle>
            <CardDescription>
              Compare this weeks total estimate gross profits against the
              2023&apos;s averages using the margin in the Product file.
              Excludes complete ELVs.
            </CardDescription>
          </CardHeader>
          <DailyProfitBars data={currWeekTotals.weeklyProfits} />
        </Card>
        <Card className="w-[520px] h-auto">
          <CardHeader>
            <CardTitle>Last Week Total Est. Gross Profit</CardTitle>
            <CardDescription>
              Compare last weeks total estimate gross profit against the
              2023&apos;s averages using the margin in the Product file.
              Excludes complete ELVs.
            </CardDescription>
          </CardHeader>
          <DailyProfitBars data={prevWeekTotals.weeklyProfits} />
        </Card>
      </div>
    </>
  )
}

export default UniWin
