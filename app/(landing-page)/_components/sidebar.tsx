import { SidebarItem } from "./sidebar-item"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"

export const Sidebar = () => {
  return (
    <>
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
    </>
  )
}
