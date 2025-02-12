'use client'

import useSWR from 'swr'

import { User } from '@prisma/client'
import { UpdateUser } from '@/actions/update-user'
import { GetUsers } from '@/actions/get-users'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useEffect, useMemo, useState } from 'react'

import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_Cell,
} from 'material-react-table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const UserPage = () => {
    // @ts-ignore
    const { data, isLoading, error } = useSWR<User[]>('/api/getUsers', GetUsers)
    const [liveData, setLiveData] = useState<User[]>(data ? data : [])

    useEffect(() => {
        if (data) {
            setLiveData(data)
        }
    }, [data])

    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ cell }: { cell: MRT_Cell<User, unknown> }) => {
                    return (
                        <div className="min-w-[155px]">
                            {cell.getValue() as string}
                        </div>
                    )
                },
            },
            {
                accessorKey: 'initials',
                header: 'Initials',
            },
            {
                header: 'User Type',
                accessorKey: 'userTypeId',
                Cell: ({ cell }) => (
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
                                <SelectItem value="userplus">
                                    userplus
                                </SelectItem>
                                <SelectItem value="staff">staff</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="land">land</SelectItem>
                                <SelectItem value="farmland">
                                    farmland
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ cell }: { cell: MRT_Cell<User, unknown> }) => {
                    return (
                        <div className="min-w-[155px]">
                            {cell.getValue() as string}
                        </div>
                    )
                },
            },
        ],
        [] // Empty dependency array since columns don't depend on any external values
    )

    return (
        <>
            <Card className="max-w-5xl w-[92vw] mx-[4vw] mb-4">
                <CardHeader>
                    <CardTitle>User Settings</CardTitle>
                    <CardDescription>
                        Check user statistics and modify access rights
                    </CardDescription>
                </CardHeader>

                <div className="px-4 md:px-6 pb-3">
                    {data ? (
                        <MaterialReactTable
                            columns={columns}
                            data={data}
                            initialState={{
                                density: 'compact',
                                pagination: { pageIndex: 0, pageSize: 50 },
                            }}
                        />
                    ) : (
                        <div className="flex flex-col gap-2 border border-slate-200 rounded-md shadow-sm p-4">
                            <div className="flex flex-row gap-4">
                                <Skeleton className="w-[25%] h-10 rounded-md" />
                                <Skeleton className="w-[40%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                            </div>
                            <div className="flex flex-row gap-4">
                                <Skeleton className="w-[25%] h-10 rounded-md" />
                                <Skeleton className="w-[40%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                            </div>
                            <div className="flex flex-row gap-4">
                                <Skeleton className="w-[25%] h-10 rounded-md" />
                                <Skeleton className="w-[40%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                                <Skeleton className="w-[10%] h-10 rounded-md" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </>
    )
}

export default UserPage
