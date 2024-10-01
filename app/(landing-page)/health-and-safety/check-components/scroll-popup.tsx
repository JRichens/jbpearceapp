'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GalleryHorizontalEnd, MoveRight } from 'lucide-react'

export function ScrollPopup() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if the popup has been shown before
        const hasShownPopup = localStorage.getItem('hasShownScrollPopup')

        if (!hasShownPopup) {
            // Show the popup
            setIsVisible(true)

            // Set a timer to hide the popup after 1.5 seconds
            const timer = setTimeout(() => {
                setIsVisible(false)
                // Mark that the popup has been shown
                localStorage.setItem('hasShownScrollPopup', 'true')
            }, 1500)

            // Clean up the timer
            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="scroll-popup"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center z-50"
                >
                    <div className="bg-black/50 text-white text-3xl flex items-center gap-x-4 p-4 rounded-lg shadow-lg">
                        Scroll <GalleryHorizontalEnd size={40} />{' '}
                        <MoveRight size={40} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
