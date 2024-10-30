'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import { CompanyVehicles, MOTStatus, TAXStatus } from '@prisma/client'
import { useEffect, useState } from 'react'
import { UpdateCompanyVehicle } from '@/actions/companyVehicles/company-vehicle'
import { Loader2 } from 'lucide-react'

const COMPANY_OPTIONS = ['J B Pearce', 'Farm', 'Gradeacre'] as const
type CompanyType = (typeof COMPANY_OPTIONS)[number]

interface ModifyVehiclePopupProps {
    open: boolean
    setOpen: (open: boolean) => void
    vehicleData: CompanyVehicles | null
}

const ModifyVehiclePopup = ({
    open,
    setOpen,
    vehicleData,
}: ModifyVehiclePopupProps) => {
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        registration: '',
        company: '' as CompanyType | '',
        description: '',
        MOTstatus: '' as MOTStatus,
        MOTdate: '',
        TAXstatus: '' as TAXStatus,
        TAXdate: '',
    })

    const motStatusOptions = Object.values(MOTStatus)
    const taxStatusOptions = Object.values(TAXStatus)

    useEffect(() => {
        if (vehicleData) {
            setFormData({
                registration: vehicleData.registration || '',
                company: (vehicleData.company || '') as CompanyType | '', // Type assertion here
                description: vehicleData.description || '',
                MOTstatus: vehicleData.MOTstatus,
                MOTdate: vehicleData.MOTdate || '',
                TAXstatus: vehicleData.TAXstatus,
                TAXdate: vehicleData.TAXdate || '',
            })
        }
    }, [vehicleData])

    const handleChange =
        (field: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }))
        }

    const handleSelectChange = (field: keyof typeof formData) => (e: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }))
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSave = async () => {
        try {
            // Show loading state
            setIsSaving(true)

            const result = await UpdateCompanyVehicle({
                registration: formData.registration,
                company: formData.company,
                description: formData.description,
                MOTstatus: formData.MOTstatus,
                MOTdate: formData.MOTdate,
                TAXstatus: formData.TAXstatus,
                TAXdate: formData.TAXdate,
            })

            if (result) {
                toast.success('Vehicle updated successfully')
                setOpen(false)
                // Optionally refresh the data or update local state
                // You might want to call a refresh function here
            }
        } catch (error) {
            console.error('Error updating vehicle:', error)
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update vehicle'
            )
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                Vehicle Details - {vehicleData?.registration}
                {' ('}
                {vehicleData?.description}
                {')'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-row gap-4">
                        <TextField
                            id="registration"
                            label="Registration"
                            variant="outlined"
                            value={formData.registration}
                            onChange={handleChange('registration')}
                            autoFocus
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="company-label">Company</InputLabel>
                            <Select
                                labelId="company-label"
                                id="company"
                                value={formData.company}
                                label="Company"
                                onChange={handleSelectChange('company')}
                                fullWidth
                            >
                                {COMPANY_OPTIONS.map((company) => (
                                    <MenuItem key={company} value={company}>
                                        {company}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <TextField
                        id="description"
                        label="Description"
                        variant="outlined"
                        value={formData.description}
                        onChange={handleChange('description')}
                        fullWidth
                    />
                    <div className="flex flex-row gap-4">
                        <FormControl className="w-1/3">
                            <InputLabel id="mot-status-label">
                                MOT Status
                            </InputLabel>
                            <Select
                                labelId="mot-status-label"
                                id="MOTstatus"
                                value={formData.MOTstatus}
                                label="MOT Status"
                                onChange={handleSelectChange('MOTstatus')}
                                fullWidth
                            >
                                {motStatusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            id="MOTdate"
                            label="MOT Date"
                            variant="outlined"
                            type="date"
                            value={formData.MOTdate}
                            onChange={handleChange('MOTdate')}
                            className="w-1/3"
                        />
                        <TextField
                            id="MOTdays"
                            label="MOT Days"
                            variant="outlined"
                            value={vehicleData?.MOTdays ?? ''}
                            InputProps={{ readOnly: true }}
                            className="w-1/3"
                        />
                    </div>
                    <div className="flex flex-row gap-4">
                        <FormControl className="w-1/3">
                            <InputLabel id="tax-status-label">
                                Tax Status
                            </InputLabel>
                            <Select
                                labelId="tax-status-label"
                                id="TAXstatus"
                                value={formData.TAXstatus}
                                label="Tax Status"
                                onChange={handleSelectChange('TAXstatus')}
                                fullWidth
                            >
                                {taxStatusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            id="TAXdate"
                            label="Tax Date"
                            variant="outlined"
                            type="date"
                            value={formData.TAXdate}
                            onChange={handleChange('TAXdate')}
                            InputLabelProps={{ shrink: true }}
                            className="w-1/3"
                        />
                        <TextField
                            id="TAXdays"
                            label="Tax Days"
                            variant="outlined"
                            value={vehicleData?.TAXdays ?? ''}
                            InputProps={{ readOnly: true }}
                            className="w-1/3"
                        />
                    </div>
                    {/* Cancel Save Buttons */}
                    <div className="flex flex-row justify-end gap-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="w-1/2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-1/2 flex items-center justify-center"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin mr-2" />
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

export default ModifyVehiclePopup
