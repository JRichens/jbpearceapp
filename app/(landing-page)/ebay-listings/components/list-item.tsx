'use client'

import { Card } from '@/components/ui/card'
import { ListingForm } from './listing/ListingForm'

export default function ListItem() {
    return (
        <Card className="p-4 sm:p-6 w-full max-w-[600px]">
            <ListingForm />
        </Card>
    )
}
