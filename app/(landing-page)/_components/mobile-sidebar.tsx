"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { useMobileSidebar } from "@/hooks/use-mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export const MobileSidebar = () => {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  const onOpen = useMobileSidebar((state) => state.onOpen)
  const onClose = useMobileSidebar((state) => state.onClose)
  const isOpen = useMobileSidebar((state) => state.isOpen)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  //side bar closes when user navigates
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  if (!isMounted) return null

  return (
    <>
      <Button
        onClick={onOpen}
        className=" block md:hidden mr-3"
        variant="ghost"
        size="sm"
      >
        <Menu className="h-7 w-7" />
      </Button>
      <Sheet
        open={isOpen}
        onOpenChange={onClose}
      >
        <SheetContent
          side="left"
          className="p-2"
        >
          <Sidebar />
        </SheetContent>
      </Sheet>
    </>
  )
}
