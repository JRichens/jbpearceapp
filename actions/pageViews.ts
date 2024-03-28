"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export default async function PageViews(url: string) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the user in the database
  try {
    const today = new Date().toISOString().split("T")[0]
    console.log("Today:", today)
    const pageView = await db.pageView.findFirst({
      where: { page: url },
      include: {
        days: {
          where: { created: { gte: new Date(today) } },
        },
      },
    })
    console.log("PageView:", pageView)
    if (pageView) {
      const pageViewDay = pageView.days[0]
      if (pageViewDay) {
        await db.pageViewDay.update({
          where: { id: pageViewDay.id },
          data: {
            users: {
              connect: { id: userId },
            },
          },
        })
      } else {
        await db.pageViewDay.create({
          data: {
            description: today,
            pageView: {
              connect: { id: pageView.id },
            },
            users: {
              connect: { id: userId },
            },
          },
        })
      }
    } else {
      console.log("Creating page view with UserId:", userId)
      // Get id from clerkID
      const actualId = await db.user.findFirst({ where: { clerkId: userId } })
      await db.pageView.create({
        data: {
          page: url,
          days: {
            create: {
              description: today,
              users: {
                connect: { id: actualId?.id },
              },
            },
          },
        },
      })
    }
  } catch (error) {
    console.error("Error", error)
  }
}
