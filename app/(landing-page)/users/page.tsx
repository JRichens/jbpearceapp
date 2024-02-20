import { User } from "@prisma/client"

import { GetUsers } from "@/actions/get-users"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"

const UserPage = async () => {
  const data = await GetUsers()

  return (
    <>
      <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>
            Check user statistics and modify access rights
          </CardDescription>
        </CardHeader>

        <div className="px-4 md:px-6 pb-3">
          {data ? (
            <DataTable
              columns={columns}
              data={data}
            />
          ) : (
            <div>No data available</div>
          )}
        </div>
      </Card>
    </>
  )
}

export default UserPage
