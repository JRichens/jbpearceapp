'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import { useFormContext } from 'react-hook-form'

import useOnclickOutside from 'react-cool-onclickoutside'

import { Input } from './ui/input'
import { Separator } from './ui/separator'

type SearchedData = {
    id: string
    type: string
    summaryline: string
    locationsummary: string
    count: number
}

type Address = {
    addressline1: string
    addressline2: string
    summaryline: string
    buildingname: string
    premise: string
    street: string
    dependentlocality: string
    posttown: string
    county: string
    postcode: string
    recodes: string
}[]

const PostcodeFinder = () => {
    const [search, setSearch] = useState('')
    const [searchData, setSearchData] = useState<SearchedData[]>([])
    const [fullAddress, setFullAddress] = useState<Address>([])
    const [suggestionDropdown, setSuggestionDropdown] = useState(false)

    const dropdownRef = useOnclickOutside(() => {
        setSuggestionDropdown(false)
    })

    const { setValue } = useFormContext()

    const getPostcode = React.useCallback(async () => {
        try {
            const response = await fetch(
                `https://ws.postcoder.com/pcw/autocomplete/find?query=${search}&country=uk&apikey=${process.env.NEXT_PUBLIC_GETADDRESS_KEY}&format=json`
            )
            const data = await response.json()
            setSearchData(data)
            setSuggestionDropdown(true)
        } catch (error) {
            console.log(error)
        }
    }, [search]) // Only recreate when search changes

    const getAddress = React.useCallback(
        async (suggestionid: string) => {
            try {
                const response = await fetch(
                    `https://ws.postcoder.com/pcw/autocomplete/retrieve?id=${suggestionid}&query=${search}&country=uk&apikey=${process.env.NEXT_PUBLIC_GETADDRESS_KEY}&format=json&lines=2`
                )
                const data: Address = await response.json()

                setValue('firstLineAddress', data[0].addressline1)
                setValue('secondLineAddress', data[0].addressline2)
                setValue('townCity', data[0].posttown)
                setValue('postcode', data[0].postcode)

                setFullAddress(data)
                setSuggestionDropdown(false)

                return data
            } catch (error) {
                console.log(error)
            }
        },
        [search, setValue]
    ) // Only recreate when search or setValue changes

    // Debounce effect on typing postcode
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!search || search.length < 3) return
            await getPostcode()
        }, 200)

        return () => {
            clearTimeout(timer)
        }
    }, [search, getPostcode]) // Include getPostcode in dependencies since it's used inside the effect

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-2 relative">
                    {!fullAddress[0] && (
                        <Input
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            placeholder="Search address..."
                            autoComplete="new-password"
                            autoFocus
                            className="w-[320px]"
                        />
                    )}

                    {suggestionDropdown &&
                        searchData.length > 0 &&
                        search.length > 2 && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-[45px] max-h-[200px] overflow-y-auto text-sm  bg-white border-[1px] rounded-md p-2"
                            >
                                <ul>
                                    {searchData &&
                                        searchData.map(
                                            (suggestion: SearchedData) => (
                                                <li
                                                    key={suggestion.id}
                                                    onClick={() =>
                                                        getAddress(
                                                            suggestion.id
                                                        )
                                                    }
                                                    className="hover:bg-gray-100"
                                                >
                                                    {/* Do not render Separator if it is the first item */}
                                                    {suggestion.id !==
                                                        searchData[0].id && (
                                                        <Separator />
                                                    )}
                                                    <div className="py-1">
                                                        {suggestion.summaryline +
                                                            ', ' +
                                                            suggestion.locationsummary}
                                                    </div>
                                                </li>
                                            )
                                        )}
                                </ul>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export default PostcodeFinder
