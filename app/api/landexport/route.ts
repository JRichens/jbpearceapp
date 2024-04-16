import * as XLSX from "xlsx"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GET(data: any) {
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated")
  }

  const landAreas = await db.landArea.findMany()

  // using XLSX to export the LandArea useSWR data as CSV
  const jsonTableData = landAreas
    .sort((a, b) => a.plotNo.localeCompare(b.plotNo))
    .map((landArea) => {
      return {
        Plot_No: landArea.plotNo,
        Registry_No: landArea.registryNo,
        Name: landArea.name,
        Ownership: landArea.ownership,
        Purchase_Date: landArea.purchaseDate,
        Purchase_Price: landArea.purchasePrice,
        ST_Coords: landArea.STid,
        Area: Number(landArea.area).toFixed(2),
        Description: landArea.description,
      }
    })

  const worksheet = XLSX.utils.json_to_sheet(jsonTableData)
  const csv = XLSX.utils.sheet_to_csv(worksheet, {
    forceQuotes: true,
  })

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Disposition": "attachment; filename=landexport.csv",
      "Content-Type": "text/csv",
    },
  })
}
