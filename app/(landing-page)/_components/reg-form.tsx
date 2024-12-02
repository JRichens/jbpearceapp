'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import getCarDetailsAsJSON from '@/lib/vehicleapi'
import { Car } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface FormProps {
    setVehicle: Dispatch<SetStateAction<Car | null>>
    search?: string
    autoFocus?: boolean
}

export const Form = ({ setVehicle, search, autoFocus = true }: FormProps) => {
    const [reg, setReg] = useState(search ? search : '')
    const [pending, setPending] = useState(false)
    const { toast } = useToast()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()

        setPending(true)
        console.log('set pending, reg:', reg)

        try {
            console.log('getting vehicle data')
            const vehicleData: Car | null = await getCarDetailsAsJSON(reg)
            console.log('got vehicleData')
            console.log('This is our vehicle:', vehicleData)

            if (!vehicleData) {
                toast({
                    title: 'Could not find vehicle',
                    description: 'Please check the registration is correct',
                    variant: 'destructive',
                })
                setVehicle && setVehicle(null)

                return
            } else {
                setVehicle && setVehicle(vehicleData)
            }
            // Removed setReg('') to keep the registration in the input
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="flex items-center gap-3 mt-1.5">
            <Input
                id="reg"
                name="reg"
                required
                value={reg}
                autoFocus={autoFocus}
                placeholder="Registration.."
                onKeyDown={(event) => {
                    if (event.key === ' ') {
                        event.preventDefault()
                    }
                }}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                className="text-xl max-w-[150px]"
            />
            <Button
                type="button"
                disabled={pending}
                className="w-20"
                onClick={handleSearch}
            >
                {pending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    'Search'
                )}
            </Button>
        </div>
    )
}
