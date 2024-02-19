"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GetUser() {
  const { userId }: { userId: string | null } = auth()

  if (userId) {
    try {
      const user = await db.user.findFirst({
        where: {
          clerkId: userId,
        },
      })

      return user
    } catch (error) {
      console.log(error)
    }
  }
}
