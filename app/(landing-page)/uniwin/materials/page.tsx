import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Materials } from "@/types/uniwindata"
import { columns } from "./_components/columns"
import { DataTable } from "./_components/data-table"
import { revalidateTag } from "next/cache"
import { NavMenu } from "../nav-menu"
import { Separator } from "@/components/ui/separator"

async function getData(): Promise<Materials[]> {
  const res = await fetch("http://localhost:4000/materials", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 1,
      tags: ["materials"],
    },
  })
  const data = await res.json()
  return data
}

const MaterialsPage = async () => {
  const data = await getData()
  revalidateTag("materials")

  return (
    <>
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
        </CardHeader>

        <div className="px-4 md:px-6 pb-3">
          <ScrollArea className="">
            <DataTable
              columns={columns}
              data={data}
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Card>
    </>
  )
}

export default MaterialsPage
