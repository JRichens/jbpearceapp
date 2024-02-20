"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function UpdateUser(id: string, userType: string) {
  // console.log("id and userType passed:", id, userType)
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Now, update the User with the new userType.
  try {
    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: {
        userTypeId: userType,
      },
    })
    return updatedUser
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function FetchUserTypes() {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }
  const userTypes = await db.userType.findMany()
  return userTypes
}
