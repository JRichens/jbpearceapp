import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollPopup } from "../_components/scroll-popup"
import Quote from "./_components/_quote/quote"

const TransportPods = () => {
  return (
    <>
      <ScrollPopup />
      <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
        <ScrollArea>
          <CardHeader>
            <CardTitle>Transport PODs</CardTitle>
            <CardDescription>
              Create a new delivery/collection job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="quote"
              className="w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quote">Quote</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="complete">Complete</TabsTrigger>
                <TabsTrigger value="paid">Invoice Paid</TabsTrigger>
              </TabsList>
              <TabsContent value="quote">
                <Quote />
              </TabsContent>
              <TabsContent value="live">
                This will be a list of all live jobs
              </TabsContent>
              <TabsContent value="complete">
                This will be a list of all completed jobs
              </TabsContent>
              <TabsContent value="paid">
                This will be a list of all paid jobs
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p></p>
          </CardFooter>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </>
  )
}

export default TransportPods
