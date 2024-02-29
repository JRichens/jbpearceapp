"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

export async function GetCustomers() {
  const { userId }: { userId: string | null } = auth()

  // Ensure that a userId is present.
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Get all the users in the database
  try {
    const customers = await db.customer.findMany()
    return customers
  } catch (error) {
    console.log(error)
  }
}
