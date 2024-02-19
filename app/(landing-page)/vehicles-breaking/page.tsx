"use client"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { DataTable } from "../daily-site-checks/_components/data-table"

import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"

type IUser = {
  Code: string
  File: string
}

const BreakingVehicles = () => {
  const [users, setUsers] = useState<any[]>([])
  const [inputData, setInputData] = useState<{ code: string; file: string }>({
    code: "",
    file: "",
  })

  const getUsers = async () => {
    try {
      const response = await fetch("/api/odbc", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const responseData = await response.json()
      console.log("users-data", responseData?.data)

      setUsers(responseData?.data)
    } catch (error: any) {
      setUsers([])
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "Code",
      header: "The Code",
    },
    {
      accessorKey: "String24",
      header: "Description",
      cell: ({ cell }) => {
        let inputData = {
          code: "",
          file: "",
        }
        const handleInputChange = (
          event: React.ChangeEvent<HTMLInputElement>
        ) => {
          const { name, value } = event.target
          inputData = { ...inputData, [name]: value }
          console.log(inputData)
        }

        const handleUpdate = async () => {
          try {
            // call your api to update the String24 data
          } catch (error) {
            console.log(error)
          }
        }

        return (
          <>
            <Input
              name="code"
              defaultValue={
                inputData.code ? inputData.code : (cell.getValue() as string)
              }
              onChange={handleInputChange}
            />
          </>
        )
      },
    },
  ]

  return (
    <div className="max-w-2xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
      <h1 className="font-bold text-2xl">Breaking Vehicles</h1>
      <p>Search for vehicles that are breaking</p>
      <Separator className="mt-2 mb-6" />
      <DataTable
        columns={columns}
        data={users}
      />
    </div>
  )
}

export default BreakingVehicles
