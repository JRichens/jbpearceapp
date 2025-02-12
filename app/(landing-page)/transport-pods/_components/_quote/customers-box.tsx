'use client'

import * as React from 'react'

import { GetCustomers } from '@/actions/get-customers'
import { Customer } from '@prisma/client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { NewCustomerDrawer } from './new-customer-drawer'

export function CustomerCombobox() {
    const [openPopover, setOpenPopover] = React.useState(false)
    const [value, setValue] = React.useState('')
    const [typedValue, setTypedValue] = React.useState('')
    const [customers, setCustomers] = React.useState<Customer[]>([])

    // Get customers from prisma server action
    React.useEffect(() => {
        const getCustomers = async () => {
            const response = await GetCustomers()
            response && setCustomers(response)
        }
        getCustomers()
    }, []) // Empty dependency array since we only want to fetch once on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypedValue(e.target.value)
    }

    return (
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopover}
                    className="w-[320px] justify-between"
                >
                    {value
                        ? customers.find(
                              (customer) =>
                                  customer.name.toLocaleLowerCase() === value
                          )?.name
                        : 'Select customer...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput
                        onChangeCapture={handleChange}
                        placeholder="Search customer..."
                    />
                    <CommandEmpty>
                        No customer found.
                        <NewCustomerDrawer
                            customer={typedValue}
                            setOpenPopover={setOpenPopover}
                            setValue={setValue}
                        />
                    </CommandEmpty>
                    <CommandGroup>
                        {customers.map((customer) => (
                            <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={(currentValue: any) => {
                                    setValue(
                                        currentValue === value
                                            ? ''
                                            : currentValue
                                    )
                                    setOpenPopover(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value ===
                                            customer.name.toLocaleLowerCase()
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {customer.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
