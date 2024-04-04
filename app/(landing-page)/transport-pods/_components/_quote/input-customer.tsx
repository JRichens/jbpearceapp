"use client"

import { useState } from "react"

import { GetCustomers } from "@/actions/get-customers"

import useSWR from "swr"

import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewCustomerDrawer } from "./new-customer-drawer"

import { motion, AnimatePresence } from "framer-motion"

const InputCustomer = () => {
  const [customer, setCustomer] = useState<string>("")
  const [value, setValue] = useState<string>("")
  const [open, setOpen] = useState(false)

  const { data, error, isLoading } = useSWR("GetCustomers", GetCustomers, {
    refreshInterval: 5000, // Fetch data every 5 seconds
  })

  // Filter customers based on input value
  const filteredCustomers = data?.filter((c) =>
    c.name.toLowerCase().includes(customer.toLowerCase())
  )

  return (
    <>
      <div className="relative flex flex-row items-center gap-2">
        <Input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer..."
          className="w-[280px]"
        />
        <NewCustomerDrawer
          customer={customer}
          setOpenPopover={setOpen}
          setValue={setValue}
        />

        {/* dropdown on typing showing customers from db */}
        {/* conditionally render the dropdown based on wheter the user is typing */}
        <AnimatePresence>
          {customer && filteredCustomers && filteredCustomers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-[280px] z-10 flex flex-col absolute bg-white top-11 left-0 border border-slate-200 rounded-md shadow-sm h-52 overflow-auto"
            >
              {filteredCustomers?.map((customer, index) => (
                <div
                  key={customer.id}
                  className="hover:bg-slate-100 cursor-pointer py-1 px-2"
                >
                  {customer.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default InputCustomer
