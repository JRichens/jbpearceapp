import { auth, currentUser } from "@clerk/nextjs"
import { db } from "../../lib/db"

const LandingPage = async () => {
  const { userId } = auth()
  // check if the user exists in the prisma db
  const checkUserExists = async () => {
    if (userId) {
      const user = await db.user.findFirst({
        where: {
          clerkId: userId,
        },
      })
      if (user) {
        return true
      } else {
        return false
      }
    }
    return false
  }

  const userExists = await checkUserExists()

  const createPrismaUser = async () => {
    const clerkUser = await currentUser()

    if (userId && clerkUser) {
      await db.user.create({
        data: {
          clerkId: userId,
          userTypeId: "user",
          name: clerkUser.firstName + " " + clerkUser?.lastName,
          email: clerkUser.emailAddresses[0]?.emailAddress,
        },
      })
    }
  }

  if (!userExists) {
    await createPrismaUser()
  }

  return <h1>{userId ? userId : "Not signed in"}</h1>
}

export default LandingPage
