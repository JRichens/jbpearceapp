import { auth, currentUser } from "@clerk/nextjs"
import { db } from "../../lib/db"

import LottieAnimation from "./lottieAnimation"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import BlackOut from "./blackOut"

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

  return (
    <>
      <div className="absolute top-10 left-10 z-50 block sm:hidden">
        <BlackOut />
      </div>
      <div
        className={cn(
          "mt-10 flex flex-col items-center justify-center max-w-xl mx-auto gap-2 p-4 h-[calc(100vh-14rem)]"
        )}
      >
        <div className="flex flex-col items-center bg-white bg-opacity-40 p-4 rounded-2xl shadow-xl">
          <p className="text-2xl">Welcome to </p>
          <div className="flex flex-row items-center">
            <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-gold">
              J B Pearce&apos;s
            </span>
            <span className="mx-1"> </span>
            <p className="text-2xl">App</p>
          </div>

          <p className="block sm:hidden">
            Click the <Menu className="h-5 w-5 inline" /> to get started
          </p>
        </div>
        <LottieAnimation />
      </div>
    </>
  )
}

export default LandingPage
