import { Button } from "@/components/ui/button"
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
import { useState, useTransition } from "react"
import { UpdateInitials } from "@/actions/update-initials"

type Props = {
  initialsDialog: boolean
  setInitialsDialog: React.Dispatch<React.SetStateAction<boolean>>
  initials: string
  setInitials: React.Dispatch<React.SetStateAction<string>>
}

export function DialogInitials({
  initialsDialog,
  setInitialsDialog,
  initials,
  setInitials,
}: Props) {
  const [errorValue, setErrorValue] = useState("")
  const [inputValue, setInputValue] = useState(initials)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (inputValue.length < 2) {
      setErrorValue("Initials must be 2 characters long")
    } else {
      setErrorValue("")
      startTransition(() => {
        UpdateInitials(inputValue)
      })
      setInitials(inputValue)
      setInitialsDialog(false)
    }
  }

  return (
    <Dialog open={initialsDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Initials</DialogTitle>
          <DialogDescription>
            Your initials will be used to show who paid the ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="name"
              className="text-right"
            >
              Initials
            </Label>
            <Input
              className="col-span-3 uppercase"
              maxLength={2}
              minLength={2}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.toUpperCase())
              }}
            />
            <span className="text-red-600 absolute left-[7rem] top-[3.5rem]">
              {errorValue}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => handleClick()}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
