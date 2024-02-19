"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function GetTasks() {
  try {
    console.log("Getting tasks + revalidating: " + new Date())
    const tasks = await db.task.findMany()
    revalidatePath("/daily-site-checks")
    return tasks
  } catch (error) {
    console.log(error)
  }
}
