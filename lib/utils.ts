import React from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Debounce waits for a certain amount of time before executing an optional function
// with the option if to debounce or not using the shouldDebounce parameter
export function useDebounce(
    value: any,
    delay: number,
    callback?: Function,
    shouldDebounce = true
) {
    const [debouncedValue, setDebouncedValue] = React.useState(value)

    React.useEffect(() => {
        if (!shouldDebounce) return
        const handler = setTimeout(() => {
            setDebouncedValue(value)
            callback && callback(value)
        }, delay)
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay, callback, shouldDebounce])
}
