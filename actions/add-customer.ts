"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"

type CustomerArgs = {
  name: string
  firstLineAddress: string | undefined
  secondLineAddress: string | undefined
  townCity: string | undefined
  postcode: string | undefined
  emailpod?: string | undefined
  emailinvoice?: string | undefined
  mobile?: string | undefined
  officephone?: string | undefined
}

export async function AddCustomer(customerDetails: CustomerArgs) {
  // Validate that a userId is present.
  const { userId }: { userId: string | null } = auth()
  if (!userId) {
    throw new Error("User must be authenticated.")
  }

  // Update the user in the database
  try {
    const customer = await db.customer.create({
      data: {
        ...customerDetails,
      },
    })
    return customer
  } catch (error) {
    console.error("Error", error)
  }
}
