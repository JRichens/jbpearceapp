'use client'

import { useState } from 'react'

import { AddCompanyVehicle } from '@/actions/companyVehicles/company-vehicle'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, PlusIcon } from 'lucide-react'

type Props = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddVehiclePopup = ({ open, setOpen }: Props) => {
    const [saving, setSaving] = useState(false)
    const [reg, setReg] = useState('')
    const [desc, setDesc] = useState('')
    const [company, setCompany] = useState('')

    const handleSave = async () => {
        if (reg && desc && company) {
            setSaving(true)
            await AddCompanyVehicle(reg, desc, company)
            setReg('')
            setDesc('')
            setCompany('')
            setSaving(false)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-36 flex flex-row">
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Add Vehicle
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vehicle Details</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    {/* Row 1 */}
                    <div className="flex flex-row gap-4">
                        <div className="w-[50%]">
                            <Label>Registration</Label>
                            <Input
                                value={reg}
                                onChange={(e) =>
                                    setReg(e.target.value.toUpperCase())
                                }
                                className="mb-2 uppercase"
                            />
                        </div>
                        <div className="w-[50%]">
                            <Label>Company</Label>
                            <Select
                                value={company}
                                onValueChange={(value) => setCompany(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="J B Pearce">
                                        J B Pearce
                                    </SelectItem>
                                    <SelectItem value="Farm">Farm</SelectItem>
                                    <SelectItem value="Gradeacre">
                                        Gradeacre
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="w-[100%]">
                        <Label>Vehicle Description</Label>
                        <Input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="mb-2"
                        />
                    </div>
                    {/* Row 3 */}
                    <div className="flex flex-row justify-end gap-2 w-full">
                        <Button
                            className="w-20"
                            variant={'outline'}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="w-20"
                            onClick={handleSave}
                            disabled={
                                reg === '' || desc === '' || company === ''
                            }
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddVehiclePopup
