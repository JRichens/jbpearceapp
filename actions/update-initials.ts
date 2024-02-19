"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function UpdateInitials(initials: string) {
  const { userId }: { userId: string | null } = auth()

  if (userId) {
    try {
      const user = await db.user.findFirst({
        where: {
          clerkId: userId,
        },
      })

      if (!user) {
        return null
      } else {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            initials: initials,
          },
        })
      }

      return user
    } catch (error) {
      console.log(error)
    }
  }
}
