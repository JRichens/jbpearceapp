'use client'

import { Card } from '@/components/ui/card'
import { ListingForm } from './listing/ListingForm'

export default function ListItem() {
    return (
        <Card className="mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md max-w-[600px]">
            <ListingForm />
        </Card>
    )
}
