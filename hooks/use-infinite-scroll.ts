import { useEffect, useRef, useState } from 'react'

export function useInfiniteScroll<T>(
    items: T[],
    initialItemCount: number = 15
) {
    const [visibleItems, setVisibleItems] = useState<T[]>([])
    const [hasMore, setHasMore] = useState(true)
    const currentCountRef = useRef(initialItemCount)
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const isLoadingRef = useRef(false)

    // Reset when items change
    useEffect(() => {
        currentCountRef.current = initialItemCount
        setVisibleItems(items.slice(0, initialItemCount))
        setHasMore(items.length > initialItemCount)
        isLoadingRef.current = false
    }, [items, initialItemCount])

    // Setup intersection observer
    useEffect(() => {
        const loadMore = () => {
            if (isLoadingRef.current || !hasMore) return

            isLoadingRef.current = true
            const nextCount = currentCountRef.current + initialItemCount

            if (nextCount <= items.length) {
                currentCountRef.current = nextCount
                setVisibleItems(items.slice(0, nextCount))
                setHasMore(nextCount < items.length)
            } else {
                setHasMore(false)
            }

            isLoadingRef.current = false
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        )

        const currentLoader = loadMoreRef.current
        if (currentLoader) {
            observer.observe(currentLoader)
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader)
            }
            observer.disconnect()
        }
    }, [items, hasMore, initialItemCount])

    return {
        visibleItems,
        hasMore,
        loadMoreRef,
    }
}
