"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  setMenuState: React.Dispatch<React.SetStateAction<string>>
}

const LandAreasMenu = ({ setMenuState }: Props) => {
  return (
    <div className="px-2 pt-20">
      <p>Land Areas Menu</p>
      <Button
        variant={"outline"}
        onClick={() => setMenuState("default")}
        className="mt-10"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Menu
      </Button>
    </div>
  )
}

export default LandAreasMenu
