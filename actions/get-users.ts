"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { User } from "@prisma/client"
import { revalidatePath } from "next/cache"

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
    revalidatePath("/vehicles-export")
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

export async function AddUserList(passedUserId: string, listName: string) {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Create the user list in the database
  try {
    const usersList = await db.exportingList.create({
      data: {
        userId: passedUserId,
        name: listName,
      },
    })
    revalidatePath("/vehicles-export")
    return usersList
  } catch (error) {
    console.log(error)
  }
}
