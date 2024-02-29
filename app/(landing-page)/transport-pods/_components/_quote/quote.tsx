import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Plus } from "lucide-react"
import QuoteForm from "./form"

const Quote = () => {
  return (
    <>
      <Card>
        {/* Top Row */}
        <div className="p-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-5 w-5" /> New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Quote</DialogTitle>
                <DialogDescription>
                  Create a new quote from scratch
                </DialogDescription>
              </DialogHeader>
              <QuoteForm />
            </DialogContent>
          </Dialog>
        </div>
        {/* Separator */}
        <Separator />
        <div>
          Quotes hereQuotes hereQuotes hereQuotes hereQuotes hereQuotes
          hereQuotes here
        </div>
      </Card>
    </>
  )
}

export default Quote
