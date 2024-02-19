"use server"

import { db } from "@/lib/db"

export async function GetTaskDetails(taskName: string) {
  try {
    const taskDetails = await db.taskDetails.findFirst({
      where: {
        name: taskName,
      },
    })

    if (!taskDetails) {
      return null
    }

    return taskDetails.description
  } catch (error) {
    console.log(error)
  }
}
