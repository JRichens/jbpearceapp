import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { UserButton, currentUser } from "@clerk/nextjs"

import localFont from "next/font/local"
import { Poppins } from "next/font/google"
import { MobileSidebar } from "./mobile-sidebar"

const headingFont = localFont({
  src: "../../../public/fonts/font.woff2",
})
const textFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const Navbar = async () => {
  const user = await currentUser()

  return (
    <div className="z-50 fixed top-0 w-full h-14 px-4 border-b shadow-md md:shadow-sm bg-white flex items-center">
      <div className="mx-auto flex items-center w-full justify-between">
        <MobileSidebar />
        <div className="hidden md:block">
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("font-bold  text-slate-600", textFont.className)}>
            {user?.firstName}
          </span>
          <UserButton />
        </div>
      </div>
    </div>
  )
}
