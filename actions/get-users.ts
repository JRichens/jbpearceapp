"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { User } from "@prisma/client"

export async function GetUsers() {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Get all the users in the database
  try {
    const users = await db.user.findMany()
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function GetUserPlus() {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Get userPlus users
  try {
    const users = await db.user.findMany({
      where: {
        userTypeId: "userplus",
      },
    })
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function GetUsersLists(passedUserId: string) {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Get the users lists from the database
  try {
    const usersLists = await db.exportingList.findMany({
      where: {
        userId: passedUserId,
      },
      include: {
        exportings: true,
      },
    })
    return usersLists
  } catch (error) {
    console.log(error)
  }
}
