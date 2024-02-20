import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NavMenu } from "./nav-menu"
import { Separator } from "@/components/ui/separator"

const UniWin = async () => {
  return (
    <>
      <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
        <div className="pl-2">
          <NavMenu />
        </div>

        <Separator />
        <CardHeader>
          <CardTitle>UniWin Data</CardTitle>
          <CardDescription>
            Pick from the drop downs what you require. All data can be retrieved
            here.
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  )
}

export default UniWin
