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
