'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GalleryHorizontalEnd, MoveRight } from 'lucide-react'

export function ScrollPopup() {
    const controls = useAnimation()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                setIsVisible(window.innerWidth < 768)
            }
        }

        // Initial check
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, []) // Empty dependency array is fine since we're only setting up the resize listener

    useEffect(() => {
        if (!isVisible) {
            return
        }

        // Start animation
        controls.start('visible')

        // Set timeout to hide the modal after 1 second
        const timer = setTimeout(() => {
            controls.start('hidden')
        }, 1500)

        // Cleanup function to clear the timeout when the component unmounts
        return () => clearTimeout(timer)
    }, [isVisible, controls])

    if (!isVisible) {
        return null
    }

    return (
        <motion.div
            key="modal"
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
            }}
            transition={{ duration: 0.5 }}
            className="text-white z-10 text-3xl flex flex-row items-center gap-x-4 absolute top-28 left-1/2 transform -translate-x-1/2  bg-black bg-opacity-50 p-2"
        >
            Scroll <GalleryHorizontalEnd size={40} /> <MoveRight size={40} />
        </motion.div>
    )
}
