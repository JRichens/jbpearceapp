"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function CompleteTask(taskId: string, trueFalse: boolean) {
  try {
    await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        completed: trueFalse,
        completedAt: trueFalse ? new Date() : null,
        completedBy: trueFalse ? "Mike Pearce" : "",
      },
    })
  } catch (error) {
    console.log(error)
  }
  revalidatePath("/daily-site-checks")
}
