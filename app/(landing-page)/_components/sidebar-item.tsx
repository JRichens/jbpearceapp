'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { GetUser } from '@/actions/get-user'

import {
    Car,
    BookA,
    ChevronRight,
    ChevronDown,
    Store,
    ClipboardCheck,
    Scale,
    DatabaseZap,
    UserCog2Icon,
    Truck,
    MapPinned,
    Tractor,
    BellRing,
    UserCircle2,
    ListOrdered,
    Users,
    Database,
    Search,
    ClipboardList,
} from 'lucide-react'
import { BiCar } from 'react-icons/bi'
import { Button } from '@/components/ui/button'

const MenuItemSkeleton = () => {
    return (
        <div className="w-full p-2 flex items-center justify-between rounded-md bg-slate-100 animate-pulse">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-200" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="w-4 h-4 rounded bg-slate-200" />
        </div>
    )
}

export const SidebarItem = () => {
    const router = useRouter()
    const pathname = usePathname()
    const { isSignedIn, user, isLoaded } = useUser()
    const [userType, setUserType] = useState('')
    const [landUser, setLandUser] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [loadingMenu, setLoadingMenu] = useState(false)
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

    const toggleDropdown = (category: string) => {
        setOpenDropdowns((prev) =>
            prev.includes(category)
                ? prev.filter((item) => item !== category)
                : [...prev, category]
        )
    }

    const routes = [
        {
            category: 'UniWin',
            icon: <DatabaseZap className="h-6 w-6 mr-2" />,
            access: ['staff', 'admin', 'super'],
            items: [
                {
                    label: 'Customers',
                    icon: <Users className="h-5 w-5 mr-2" />,
                    href: '/uniwin/customers',
                    access: ['staff', 'admin', 'super'],
                },
                {
                    label: 'Database',
                    icon: <Database className="h-5 w-5 mr-2" />,
                    href: '/uniwin',
                    access: ['admin', 'super'],
                },
            ],
        },
        {
            label: 'Weighbridge',
            icon: <Scale className="h-6 w-6 mr-2" />,
            href: '/weighbridge',
            access: ['userplus', 'staff', 'admin', 'super'],
        },
        {
            label: 'Vehicles API',
            icon: <BookA className="h-6 w-6 mr-2" />,
            href: '/vehicles-api',
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'Breaking Vehicles',
            icon: <BiCar className="h-6 w-6 mr-2" />,
            href: '/vehicles-breaking',
            access: ['user', 'userplus', 'staff', 'admin', 'super'],
        },
        {
            label: 'Export Vehicles',
            icon: <Car className="h-6 w-6 mr-2" />,
            href: '/vehicles-export',
            access: ['userplus', 'staff', 'admin', 'super'],
        },
        {
            category: 'eBay',
            icon: <Store className="h-6 w-6 mr-2" />,
            access: ['staff', 'admin', 'super'],
            items: [
                {
                    label: 'Vehicle Search',
                    icon: <Search className="h-5 w-5 mr-2" />,
                    href: '/ebay-vehicle-search',
                    access: ['staff', 'admin', 'super'],
                },
                {
                    label: 'Listing',
                    icon: <ClipboardList className="h-5 w-5 mr-2" />,
                    href: '/ebay-listings',
                    access: ['staff', 'admin', 'super'],
                },
            ],
        },
        {
            label: 'Vehicle Reminders',
            icon: <BellRing className="h-6 w-6 mr-2" />,
            href: '/vehicle-reminders',
            access: ['super', 'admin'],
        },
        {
            label: 'Health & Safety',
            icon: <ClipboardCheck className="h-6 w-6 mr-2" />,
            href: '/health-and-safety',
            access: ['staff', 'admin', 'super'],
        },
        {
            label: 'Farm Land',
            icon: <Tractor className="h-6 w-6 mr-2" />,
            href: '/farm-land',
            access: ['admin', 'super', 'staff', 'farmland'],
        },
        {
            label: 'Land',
            icon: <MapPinned className="h-6 w-6 mr-2" />,
            href: '/land-areas',
            access: ['super', 'land'],
        },
        {
            label: 'Users',
            icon: <UserCog2Icon className="h-6 w-6 mr-2" />,
            href: '/users',
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

    // Show loading state when user type is not yet loaded
    if (!isLoaded || !userType) {
        return (
            <div className="flex flex-col items-center w-full gap-2 px-2">
                {[...Array(8)].map((_, index) => (
                    <MenuItemSkeleton key={index} />
                ))}
            </div>
        )
    }

    const renderMenuItem = (item: any) => {
        if (item.category) {
            const isOpen = openDropdowns.includes(item.category)
            const hasAccessToAnyItem = item.items.some(
                (subItem: any) =>
                    subItem.access.includes(userType) ||
                    subItem.access.includes('user')
            )

            if (!hasAccessToAnyItem) return null

            return (
                <div key={item.category} className="w-full">
                    <Button
                        className="flex-container flex items-center justify-start rounded-md p-2 w-full text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                        variant="ghost"
                        onClick={() => toggleDropdown(item.category)}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {item.icon}
                                {item.category}
                            </div>
                            <div
                                className={`transform transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </Button>
                    {isOpen && (
                        <div className="ml-6 mt-1 space-y-1">
                            {item.items.map(
                                (subItem: any) =>
                                    (subItem.access.includes(userType) ||
                                        subItem.access.includes('user')) && (
                                        <Button
                                            key={subItem.href}
                                            className={`${
                                                pathname === subItem.href
                                                    ? 'bg-slate-200 text-slate-950'
                                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                                            } flex-container flex items-center justify-start rounded-md p-2 w-full`}
                                            onClick={() =>
                                                onClick(subItem.href)
                                            }
                                            variant="ghost"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    {subItem.icon}
                                                    {subItem.label}
                                                </div>
                                                <div className="chevron-animation">
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </Button>
                                    )
                            )}
                        </div>
                    )}
                </div>
            )
        }

        return (
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
                    <div className="flex items-center justify-between w-full">
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
        )
    }

    return (
        <div className="flex flex-col items-center w-full gap-2 px-2">
            {routes.map((item) => renderMenuItem(item))}
        </div>
    )
}
