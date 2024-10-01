'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { GetUser } from '@/actions/get-user'

import {
    Car,
    BookA,
    ChevronRight,
    Store,
    ClipboardCheck,
    Scale,
    DatabaseZap,
    UserCog2Icon,
    Truck,
    MapPinned,
    Tractor,
    BellRing,
} from 'lucide-react'
import { BiCar } from 'react-icons/bi'
import { Button } from '@/components/ui/button'

export const SidebarItem = () => {
    const router = useRouter()
    const pathname = usePathname()
    const { isSignedIn, user, isLoaded } = useUser()
    const [userType, setUserType] = useState('')
    const [landUser, setLandUser] = useState(false)
    const [isPending, startTransition] = useTransition()

    const routes = [
        {
            label: 'Breaking Vehicles',
            icon: <BiCar className="h-6 w-6 mr-2" />,
            href: `/vehicles-breaking`,
            access: ['user', 'userplus', 'staff', 'admin', 'super'],
        },
        {
            label: 'Export Vehicles',
            icon: <Car className="h-6 w-6 mr-2" />,
            href: `/vehicles-export`,
            access: ['userplus', 'staff', 'admin', 'super'],
        },
        {
            label: 'Transport PODs',
            icon: <Truck className="h-6 w-6 mr-2" />,
            href: `/transport-pods`,
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'Weighbridge',
            icon: <Scale className="h-6 w-6 mr-2" />,
            href: `/weighbridge`,
            access: ['userplus', 'staff', 'admin', 'super'],
        },
        {
            label: 'Vehicles API',
            icon: <BookA className="h-6 w-6 mr-2" />,
            href: `/vehicles-api`,
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'eBay Vehicle Search',
            icon: <Store className="h-6 w-6 mr-2" />,
            href: `/ebay-vehicle-search`,
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'Health & Safety',
            icon: <ClipboardCheck className="h-6 w-6 mr-2" />,
            href: `/health-and-safety`,
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'UniWin',
            icon: <DatabaseZap className="h-6 w-6 mr-2" />,
            href: `/uniwin`,
            access: ['admin', 'super'],
        },
        {
            label: 'Vehicle Reminders',
            icon: <BellRing className="h-6 w-6 mr-2" />,
            href: `/vehicle-reminders`,
            access: ['super', 'admin'],
        },
        {
            label: 'Farm Land',
            icon: <Tractor className="h-6 w-6 mr-2" />,
            href: `/farm-land`,
            access: ['admin', 'super', 'staff', 'farmland'],
        },
        {
            label: 'Land',
            icon: <MapPinned className="h-6 w-6 mr-2" />,
            href: `/land-areas`,
            access: ['super', 'land'],
        },
        {
            label: 'Users',
            icon: <UserCog2Icon className="h-6 w-6 mr-2" />,
            href: `/users`,
            access: ['admin', 'super'],
        },
    ]

    const onClick = (href: string) => {
        router.push(href)
    }

    const userId = isSignedIn ? user?.id : null

    useEffect(() => {
        const getUserType = async () => {
            if (userId) {
                startTransition(async () => {
                    const user = await GetUser()
                    user && setUserType(user.userTypeId)
                })
            }
        }
        getUserType()
    }, [userId])

    if (!userType) {
        return null
    }

    return (
        <div className="flex flex-col items-center w-full gap-2 px-2">
            {routes.map(
                (item) =>
                    (item.access.includes(userType) ||
                        item.access.includes('user')) && (
                        <Button
                            key={item.href}
                            className={`${
                                pathname === item.href
                                    ? 'bg-slate-200 text-slate-950'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                            } flex-container flex items-center justify-start rounded-md p-2 w-full`}
                            onClick={() => onClick(item.href)}
                            variant="ghost"
                        >
                            <div className=" flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    {item.icon}
                                    {item.label}
                                </div>
                                <div className="chevron-animation">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Button>
                    )
            )}
        </div>
    )
}
