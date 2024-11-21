'use client'

import { useEffect, useState } from 'react'
import { GetWeight } from '@/actions/get-weight'
import { WeighbridgeTicket, User } from '@prisma/client'
import { cn } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GetUser } from '@/actions/get-user'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import TextField from '@mui/material/TextField'
import Image from 'next/image'
import { Plus } from 'lucide-react'

const WeighbridgeDisplay = () => {
    const [latestWeight, setLatestWeight] = useState('')
    const [stableMoving, setStableMoving] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [weighings, setWeighings] = useState<WeighbridgeTicket[]>([])
    const [newWeighing, setNewWeighing] = useState({
        created: '',
        driver: currentUser?.name || '',
        customer: '',
        material: '',
        weight1: '',
        date1: '',
        weight2: '',
        date2: '',
        weightDeduction: '',
        priceDeduction: '',
    })

    // Get our actual user from our database
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await GetUser()
                if (!user) return
                setCurrentUser(user)
                setNewWeighing({ ...newWeighing, driver: user.name })
            } catch (error) {
                console.error('Failed to fetch user', error)
            }
        }
        fetchUser()
    }, [])

    // Fetch our weight every 0.75 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Call the server action to fetch the latest weight
                const data = await GetWeight()
                if (!data) return
                setLatestWeight(data.weight)
                setStableMoving(data.stable ? 'S' : 'M')
            } catch (error) {
                console.error('Failed to fetch latest weight', error)
            }
        }, 750) // Fetch every half second

        // Cleanup interval on component unmount
        return () => clearInterval(interval)
    }, [])

    // Handle new weighing
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Add your submission logic here
            console.log('Form submitted:', newWeighing)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    return (
        <div className="relative max-w-xs mx-auto flex flex-col items-center">
            {/* Weight display remains the same... */}
            <div>
                <Input
                    className={cn(
                        'w-40 h-16 bg-slate-900 weightDisplay text-5xl text-right text-green-400 pb-3'
                    )}
                    value={latestWeight}
                    readOnly
                />
                <p
                    className={cn(
                        'font-bold absolute top-10 pl-2',
                        stableMoving === 'S' ? 'text-green-400' : 'text-red-500'
                    )}
                >
                    {stableMoving === 'S' ? 'STABLE' : 'MOVING'}
                </p>
            </div>

            {/* New Ticket Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="mt-4 bg-gold text-white hover:bg-gold/90"
                        variant="default"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Ticket
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader className="flex flex-row items-center gap-10">
                        <Image
                            src="/JBPLOGOGREEN.jpg"
                            alt="Logo"
                            width={75}
                            height={75}
                        />
                        <DialogTitle className="text-[1.6rem]">
                            New Ticket
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <TextField
                                label="Driver"
                                variant="outlined"
                                fullWidth
                                value={newWeighing.driver}
                                onChange={(e) =>
                                    setNewWeighing({
                                        ...newWeighing,
                                        driver: e.target.value,
                                    })
                                }
                            />

                            <TextField
                                label="Customer"
                                variant="outlined"
                                fullWidth
                                value={newWeighing.customer}
                                onChange={(e) =>
                                    setNewWeighing({
                                        ...newWeighing,
                                        customer: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                label="Weight Deduction"
                                variant="outlined"
                                fullWidth
                                type="number"
                                value={newWeighing.weightDeduction}
                                onChange={(e) =>
                                    setNewWeighing({
                                        ...newWeighing,
                                        weightDeduction: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                label="Material"
                                variant="outlined"
                                fullWidth
                                value={newWeighing.material}
                                onChange={(e) =>
                                    setNewWeighing({
                                        ...newWeighing,
                                        material: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                label="Price Deduction"
                                variant="outlined"
                                fullWidth
                                type="number"
                                value={newWeighing.priceDeduction}
                                onChange={(e) =>
                                    setNewWeighing({
                                        ...newWeighing,
                                        priceDeduction: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full">
                                Create Ticket
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default WeighbridgeDisplay
