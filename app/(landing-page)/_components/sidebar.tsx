"use client"

import { SidebarItem } from "./sidebar-item"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"

export const Sidebar = () => {
  const pathname = usePathname()

  if (pathname === "/land-areas") return null

  return (
    <>
      <div className="w-60 shrink-0 hidden md:block shadow-[10px_0_5px_0px_rgba(0,0,0,0.3)]">
        <div className="pt-20 sticky top-0">
          <div className="md:hidden">
            <div className="absolute top-5 left-5">
              <Logo />
            </div>
            <div className="pb-3">
              <Separator />
            </div>
          </div>
          <SidebarItem />
        </div>
      </div>
    </>
  )
}
