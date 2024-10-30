'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CompanyVehicles } from '@prisma/client'

interface AddReminderProps {
    open: boolean
    setOpen: (open: boolean) => void
    vehicleData: CompanyVehicles | null
}

const AddReminderPopup = ({ open, setOpen, vehicleData }: AddReminderProps) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Manage Reminders for - {vehicleData?.registration}
                        {' ('}
                        {vehicleData?.description}
                        {')'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Add your form or display fields here */}
                    <pre className="bg-slate-100 p-4 rounded-md">
                        {JSON.stringify(vehicleData, null, 2)}
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddReminderPopup
