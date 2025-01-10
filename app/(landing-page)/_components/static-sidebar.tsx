'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../components/ui/button'
import {
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'
import { useDesktopSidebar } from '../../../hooks/use-desktop-sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../../components/ui/tooltip'

const StaticSidebar = () => {
    const pathname = usePathname()
    const { isCollapsed, toggleCollapse } = useDesktopSidebar()

    useEffect(() => {
        console.log('Pathname: ', pathname)
    }, [pathname])

    if (pathname === '/land-areas' || pathname === '/farm-land') return null

    return (
        <div className="relative hidden md:block">
            <AnimatePresence initial={false}>
                <motion.div
                    key="sidebar"
                    initial={{ width: isCollapsed ? '0px' : '240px' }}
                    animate={{ width: isCollapsed ? '0px' : '240px' }}
                    exit={{ width: '0px' }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                    className="h-full shadow-[2px_0_3px_0px_rgba(0,0,0,0.1)] overflow-hidden"
                >
                    <div className="w-60 h-full overflow-y-auto">
                        <Sidebar />
                    </div>
                </motion.div>
            </AnimatePresence>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={toggleCollapse}
                            variant="ghost"
                            size="default"
                            className={`
                                absolute bottom-8 z-50 h-12 
                                transition-all duration-200
                                bg-slate-100 hover:bg-slate-200 hover:scale-110
                                shadow-md
                                ${
                                    isCollapsed
                                        ? 'w-16 -right-14 rounded-r-full pl-4'
                                        : 'w-12 -right-5 rounded-full'
                                }
                            `}
                        >
                            {isCollapsed ? (
                                <PanelLeftOpen className="h-6 w-6" />
                            ) : (
                                <PanelLeftClose className="h-6 w-6" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>
                            {isCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default StaticSidebar
