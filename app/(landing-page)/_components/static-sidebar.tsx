"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { useEffect } from "react"

const StaticSidebar = () => {
  const pathname = usePathname()

  useEffect(() => {
    console.log("Pathname: ", pathname)
  }, [])

  if (pathname === "/land-areas" || pathname === "/farm-land") return null
  else {
    return (
      <>
        <div className="w-60 shrink-0 hidden md:block shadow-[10px_0_5px_0px_rgba(0,0,0,0.3)]">
          <Sidebar />
        </div>
      </>
    )
  }
}

export default StaticSidebar
