'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import ListItem from './components/list-item'
import MyListings from './components/my-listings'

export default function EbayListingsPage() {
    return (
        <div className="max-w-6xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
            <h1 className="font-bold text-2xl">eBay Management</h1>
            <Separator className="mt-2 mb-6" />

            <Tabs defaultValue="list-item" className="w-full max-w-[600px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list-item">List Item</TabsTrigger>
                    <TabsTrigger value="my-listings">
                        My eBay Listings
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list-item" className="mt-6">
                    <ListItem />
                </TabsContent>
                <TabsContent value="my-listings" className="mt-6">
                    <MyListings />
                </TabsContent>
            </Tabs>
        </div>
    )
}
