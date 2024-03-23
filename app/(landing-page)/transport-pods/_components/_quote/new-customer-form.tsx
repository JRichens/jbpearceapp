"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import PostcodeFinder from "@/components/postcodeFinder"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AddCustomer } from "@/actions/add-customer"

const formSchema = z.object({
  name: z.string().min(2).max(50),
  firstLineAddress: z.string().min(6).max(50),
  secondLineAddress: z.string().max(50),
  townCity: z.string().min(2).max(50),
  postcode: z.string().min(6).max(8),
  emailinvoice: z.string().email().optional(),
  emailpod: z.string().email().optional(),
  mobile: z.string().optional(),
  officephone: z.string().optional(),
})

type Props = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  customer: string
  setOpenPopover: React.Dispatch<React.SetStateAction<boolean>>
  setValue: React.Dispatch<React.SetStateAction<string>>
}

const NewCustomerForm = ({
  setOpen,
  customer,
  setOpenPopover,
  setValue,
}: Props) => {
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer,
      firstLineAddress: "",
      secondLineAddress: "",
      townCity: "",
      postcode: "",
      emailinvoice: "",
      emailpod: "",
      mobile: "",
    },
  })
  // Submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("form values", values)
    // spread the values into the AddCustomer function
    setLoading(true)
    const customer = await AddCustomer({ ...values })
    console.log("customer", customer)
    setLoading(false)
    if (customer?.id) {
      setOpen(false)
    }
  }
  // What step the form is at
  const [step, setStep] = useState(1)
  // Loading state for the form
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Form {...form}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pb-8"
          >
            <div
              className={cn("space-y-3", {
                hidden: step !== 1,
              })}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address Finder Component */}
              <PostcodeFinder />
              {/* Address Line 1 */}
              <FormField
                control={form.control}
                name="firstLineAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Line Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Line 2 */}
              <FormField
                control={form.control}
                name="secondLineAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Line Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Town / City */}
              <FormField
                control={form.control}
                name="townCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town / City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postcode */}
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              className={cn("space-y-3", {
                hidden: step !== 2,
              })}
            >
              {/* Invoice Email */}
              <FormField
                control={form.control}
                name="emailinvoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Invoices sent here.."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* POD Email */}
              <FormField
                control={form.control}
                name="emailpod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POD Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="PODs sent here.."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Job status sent here.."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-row gap-x-2 pt-4">
              <Button
                variant="default"
                onClick={() => setOpen(false)}
                className={cn("w-full", {
                  hidden: step !== 1,
                })}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className={cn("w-full", {
                  hidden: step !== 2,
                })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // validation of data in step 1
                  form.trigger([
                    "name",
                    "firstLineAddress",
                    "secondLineAddress",
                    "townCity",
                    "postcode",
                  ])
                  const customerState = form.getFieldState("name")
                  const addressFirstLineState =
                    form.getFieldState("firstLineAddress")
                  const addressSecondLineState =
                    form.getFieldState("secondLineAddress")
                  const townCityState = form.getFieldState("townCity")
                  const postcodeState = form.getFieldState("postcode")

                  if (
                    customerState.invalid ||
                    addressFirstLineState.invalid ||
                    addressSecondLineState.invalid ||
                    townCityState.invalid ||
                    postcodeState.invalid
                  ) {
                    console.log("validation error")
                  } else {
                    setStep(step + 1)
                  }
                }}
                className={cn("w-full", {
                  hidden: step !== 1,
                })}
              >
                Next
              </Button>
              <Button
                type="submit"
                className={cn("w-full", {
                  hidden: step !== 2,
                })}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Form>
    </>
  )
}

export default NewCustomerForm
