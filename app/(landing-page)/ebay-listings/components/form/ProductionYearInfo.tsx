'use client'

import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type ProductionYearInfo = {
    from: string
    to: string
    facelift: string
    description: string
}

interface ProductionYearInfoProps {
    info: ProductionYearInfo | null
    isLoading: boolean
    className?: string
    vehicle?: {
        dvlaMake: string | null
        dvlaModel: string | null
    } | null
}

export function ProductionYearInfo({
    info,
    isLoading,
    className = '',
    vehicle,
}: ProductionYearInfoProps) {
    if (isLoading) {
        return (
            <Card className={cn('p-4', className)}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">
                        Finding compatibility for {vehicle?.dvlaMake || ''}{' '}
                        {vehicle?.dvlaModel || ''}...
                    </span>
                </div>
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </Card>
        )
    }

    if (!info) return null

    return (
        <Card className={cn('p-4', className)}>
            <div className="space-y-2">
                <div className="flex gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Production:</span>{' '}
                        <span className="font-medium">
                            {info.from} - {info.to}
                        </span>
                    </div>
                    {info.facelift && (
                        <div>
                            <span className="text-gray-500">Facelift:</span>{' '}
                            <span className="font-medium">{info.facelift}</span>
                        </div>
                    )}
                </div>
                <ScrollArea className="h-[80px]">
                    <p className="text-sm text-gray-600">{info.description}</p>
                </ScrollArea>
            </div>
        </Card>
    )
}
