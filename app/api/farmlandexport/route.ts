import * as XLSX from "xlsx"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GET(data: any) {
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated")
  }

  const farmLandAreas = await db.farmLandArea.findMany()

  // using XLSX to export the LandArea useSWR data as CSV
  const jsonTableData = farmLandAreas
    .sort((a, b) => {
      const aSBIno = a.SBIno ?? "" // Add null check here
      const bSBIno = b.SBIno ?? "" // Add null check here
      return aSBIno.localeCompare(bSBIno)
    })
    .map((farmLandArea) => {
      return {
        SBI_No: farmLandArea.SBIno,
        ST_Coords: farmLandArea.STid,
        Activity_Code: farmLandArea.activityCode ?? "",
        Name: farmLandArea.name,
        Description: farmLandArea.description,
        Hectares: Number(farmLandArea.hectares).toFixed(2),
        Acres: Number(farmLandArea.acres).toFixed(2),
      }
    })

  const worksheet = XLSX.utils.json_to_sheet(jsonTableData)
  const csv = XLSX.utils.sheet_to_csv(worksheet, {
    forceQuotes: true,
  })

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Disposition": "attachment; filename=farmlandexport.csv",
      "Content-Type": "text/csv",
    },
  })
}
