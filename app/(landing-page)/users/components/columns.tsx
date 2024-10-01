'use client'

import React, { ChangeEvent, useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { User } from '@prisma/client'
// Assuming you have a function to fetch user types and an update function
import { FetchUserTypes, UpdateUser } from '@/actions/update-user'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ cell }) => {
            return (
                <div className="min-w-[155px]">{cell.getValue() as string}</div>
            )
        },
    },
    {
        accessorKey: 'initials',
        header: 'Initials',
    },
    {
        header: 'User Typee',
        accessorKey: 'userTypeId',
        cell: ({ cell }) => {
            return (
                <div className="">
                    <Select
                        onValueChange={async (value) => {
                            console.log(
                                'id and value',
                                cell.row.original.id,
                                value
                            )
                            await UpdateUser(cell.row.original.id, value)
                        }}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue
                                placeholder={cell.getValue() as string}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="userplus">userplus</SelectItem>
                            <SelectItem value="staff">staff</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="land">land</SelectItem>
                            <SelectItem value="farmland">farmland</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )
        },
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ cell }) => {
            return (
                <div className="min-w-[155px]">{cell.getValue() as string}</div>
            )
        },
    },
]
