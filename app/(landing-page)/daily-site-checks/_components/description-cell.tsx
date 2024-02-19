// CheckViewCell.tsx

import React, { useState } from "react"
import { CheckView } from "./check-popup"
import { Button } from "@/components/ui/button"

interface CheckViewCellProps {
  cell: any // The cell's value you're passing to CheckView
}

const CheckViewCell: React.FC<CheckViewCellProps> = ({ cell }) => {
  const [dialogStatus, setDialogStatus] = useState<boolean>(false)

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => setDialogStatus(!dialogStatus)}
      >
        View Check
      </Button>
      {dialogStatus && <CheckView checkDesc={cell} />}
    </>
  )
}

export default CheckViewCell
