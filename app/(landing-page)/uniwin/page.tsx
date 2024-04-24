"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NavMenu } from "./nav-menu"
import { Separator } from "@/components/ui/separator"

import React, { PureComponent, startTransition, useEffect } from "react"
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

type Data = {
  day_of_week: string
  Avg: number
  Live: number
}

const DailyBars = ({ data }: { data: Data[] }) => {
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

const UniWin = () => {
  const [prevWeekTotals, setPrevWeekTotals] = React.useState([])
  const [currWeekTotals, setCurrWeekTotals] = React.useState([])

  useEffect(() => {
    const getWeeklyTotals = async () => {
      try {
        // Get the current date
        const today = new Date()

        // Calculate the date for the previous Monday
        const prevMonday = new Date(today)
        prevMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7)

        // Calculate the date for the previous Sunday
        const prevSunday = new Date(prevMonday)
        prevSunday.setDate(prevMonday.getDate() + 6)

        // Calculate the date for the current Monday
        const currMonday = new Date(today)
        currMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

        // Calculate the date for the current Sunday
        const currSunday = new Date(currMonday)
        currSunday.setDate(currMonday.getDate() + 6)

        // Format the dates as "YYYY-MM-DD"
        const prevWeekFrom = prevMonday.toISOString().split("T")[0]
        const prevWeekTo = prevSunday.toISOString().split("T")[0]
        const currWeekFrom = currMonday.toISOString().split("T")[0]
        const currWeekTo = currSunday.toISOString().split("T")[0]

        // Log out all the dates
        console.log("Previous week from:", prevWeekFrom)
        console.log("Previous week to:", prevWeekTo)
        console.log("Current week from:", currWeekFrom)
        console.log("Current week to:", currWeekTo)

        // Fetch data for the previous week
        const prevWeekRes = await fetch(
          `https://genuine-calf-newly.ngrok-free.app/weeklyTotals?from=${prevWeekFrom}&to=${prevWeekTo}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )
        const prevWeekData = await prevWeekRes.json()
        setPrevWeekTotals(prevWeekData)

        // Fetch data for the current week
        const currWeekRes = await fetch(
          `https://genuine-calf-newly.ngrok-free.app/weeklyTotals?from=${currWeekFrom}&to=${currWeekTo}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        )
        const currWeekData = await currWeekRes.json()
        setCurrWeekTotals(currWeekData)
      } catch (error) {}
    }
    getWeeklyTotals()
  }, [])

  return (
    <>
      <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
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
      <div className="flex flex-row flex-wrap mx-[4vw] gap-4">
        <Card className="w-[600px] h-auto">
          <CardHeader>
            <CardTitle>Current Week Totals</CardTitle>
            <CardDescription>
              Compare this weeks daily total transactions against the 2023
              averages
            </CardDescription>
          </CardHeader>
          <DailyBars data={currWeekTotals} />
        </Card>
        <Card className="w-[600px] h-auto">
          <CardHeader>
            <CardTitle>Last Week Totals</CardTitle>
            <CardDescription>
              Compare last weeks daily total transactions against the 2023
              averages
            </CardDescription>
          </CardHeader>
          <DailyBars data={prevWeekTotals} />
        </Card>
      </div>
    </>
  )
}

export default UniWin
