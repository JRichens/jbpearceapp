'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { askClaudeId } from '@/actions/claude-ai/askClaudeId'
import { Camera, ChevronDown, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TextField } from '@mui/material'
import { useToast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageCapture } from './ImageCapture'

declare global {
    interface Window {
        Image: {
            new (width?: number, height?: number): HTMLImageElement
        }
    }
}

type IdData = {
    code: string
    fullName: string
    firstLineAddress: string
    postcode: string
    registration: string
    paymentType: 'ACCINV' | 'BACS' | 'CHEQUE'
    telephone: string
    accountNo: string
    sortCode: string
    image1?: string
    image2?: string
}

type ApiResponse = {
    success: boolean
    count: number
    data: IdData[]
}

interface UpdateImageProps {
    customerCode: string
    imagePathNumber: 1 | 2
}

const NewAccount = () => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateImageRef, setUpdateImageRef] =
        useState<HTMLInputElement | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [gettingCustomers, setGettingCustomers] = useState(false)
    const [customers, setCustomers] = useState<IdData[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<IdData | null>(
        null
    )
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [idData, setIdData] = useState<IdData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formValues, setFormValues] = useState<IdData>({
        code: '',
        fullName: '',
        firstLineAddress: '',
        postcode: '',
        registration: '',
        paymentType: 'BACS', // default value
        telephone: '',
        accountNo: '',
        sortCode: '',
    })

    const { toast } = useToast()

    const processImage = async (imageData: string) => {
        try {
            const response = await fetch(imageData)
            const blob = await response.blob()
            return new File([blob], 'customer-id.jpg', { type: 'image/jpeg' })
        } catch (error) {
            console.error('Error processing image:', error)
            throw new Error('Failed to process image')
        }
    }

    const createFormData = (
        image: File,
        additionalData?: Record<string, string>
    ) => {
        const formData = new FormData()
        formData.append('image', image, 'customer-id.jpg')
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value)
            })
        }
        return formData
    }

    const filteredCustomers = customers
        .filter((customer) =>
            customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 15) // This limits the results to first 10 matches

    // Get customers from express-server api
    useEffect(() => {
        const fetchData = async () => {
            try {
                setGettingCustomers(true)
                const response = await fetch(
                    'https://genuine-calf-newly.ngrok-free.app/customers',
                    {
                        method: 'GET',
                        headers: {
                            'ngrok-skip-browser-warning': '69420',
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }

                const result: ApiResponse = await response.json()
                // Set customers with the data array from the response
                setCustomers(result.data)
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'An error occurred'
                )
            } finally {
                setGettingCustomers(false)
            }
        }

        fetchData()
    }, [])

    const isFormValid = (): boolean => {
        return (
            formValues.code.length > 0 &&
            formValues.fullName.length > 0 &&
            formValues.firstLineAddress.length > 0 &&
            formValues.postcode.length > 0 &&
            formValues.registration.length > 0 &&
            ((formValues.paymentType === 'BACS' &&
                formValues.telephone.length > 0 &&
                formValues.accountNo.length === 8 &&
                formValues.sortCode.length === 6) ||
                formValues.paymentType !== 'BACS')
        )
    }

    const handleFormSubmit = async () => {
        if (!isFormValid()) {
            setError('Please fill all required fields correctly')
            return
        }

        try {
            setIsSubmitting(true)

            let imageFile: File | null = null
            if (selectedImage) {
                imageFile = await processImage(selectedImage)
            }

            const formData = createFormData(imageFile!, {
                code: formValues.code,
                name: formValues.fullName,
                address: formValues.firstLineAddress,
                postcode: formValues.postcode,
                reg: formValues.registration,
                paymenttype: formValues.paymentType,
                tel: formValues.telephone,
                account:
                    formValues.paymentType === 'BACS'
                        ? formValues.accountNo
                        : '',
                sortcode:
                    formValues.paymentType === 'BACS'
                        ? formValues.sortCode
                        : '',
            })

            const response = await fetch(
                'https://genuine-calf-newly.ngrok-free.app/customers',
                {
                    method: 'POST',
                    headers: {
                        'ngrok-skip-browser-warning': '69420',
                    },
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    errorData.message || 'Failed to create customer'
                )
            }

            toast({
                title: 'Success',
                description: 'New customer created successfully',
                className: 'bg-green-500 text-white border-none',
            })

            // Reset form
            setFormValues({
                code: '',
                fullName: '',
                firstLineAddress: '',
                postcode: '',
                registration: '',
                paymentType: 'BACS',
                telephone: '',
                accountNo: '',
                sortCode: '',
            })
            setSelectedImage(null)
            setIdData(null)
        } catch (error) {
            console.error('Form submission error:', error)
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to submit form',
                className: 'bg-red-500 text-white border-none',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = (event) => {
                const img = new window.Image()
                img.src = event.target?.result as string

                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    // Calculate 40% of original dimensions
                    const width = img.width * 0.4
                    const height = img.height * 0.4

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'))
                        return
                    }

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, width, height)

                    // Get compressed base64 string
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
                    resolve(compressedBase64)
                }

                img.onerror = () => {
                    reject(new Error('Failed to load image'))
                }
            }

            reader.onerror = () => {
                reject(new Error('Failed to read file'))
            }
        })
    }

    const handleImageSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                const compressedImage = await compressImage(file)
                setSelectedImage(compressedImage)
                setIdData(null)
                setError(null)
            } catch (err) {
                setError('Error processing image')
                console.error(err)
            }
        }
    }

    const handleSubmit = async () => {
        if (!selectedImage) {
            setError('Please select an image first')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const base64Content = selectedImage.split(',')[1]
            const response = await askClaudeId(base64Content)

            if (typeof response === 'string') {
                setError(response)
            } else {
                setIdData({
                    ...response,
                    code: response.fullName.toUpperCase(),
                    paymentType: 'BACS',
                    registration: '',
                    sortCode: '',
                    accountNo: '',
                    telephone: '',
                })
                // Update form values with the extracted data
                setFormValues((prev) => ({
                    ...prev,
                    ...response,
                }))
            }
        } catch (err) {
            setError('An error occurred while processing the image')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // Function to update customer ID
    const updateCustomerId = async (
        customerCode: string,
        imagePathNumber: 1 | 2,
        imageData: string
    ) => {
        try {
            const imageFile = await processImage(imageData)

            const formData = createFormData(imageFile, {
                customerCode,
                imagePathNumber: imagePathNumber.toString(),
            })

            const response = await fetch(
                'https://genuine-calf-newly.ngrok-free.app/customers',
                {
                    method: 'PUT',
                    headers: {
                        'ngrok-skip-browser-warning': '69420',
                    },
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Update failed')
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error updating customer ID:', error)
            throw error
        }
    }

    const handleUpdateId = async (customer: IdData, imagePathNumber: 1 | 2) => {
        try {
            setIsUpdating(true)

            const handleImageSelected = async (file: File) => {
                try {
                    // Compress the image
                    const compressedImage = await compressImage(file)

                    // Update the customer ID
                    await updateCustomerId(
                        customer.code,
                        imagePathNumber,
                        compressedImage
                    )

                    // Show success message
                    toast({
                        title: 'Success',
                        description: `ID ${imagePathNumber} updated successfully`,
                        className: 'bg-green-500 text-white border-none',
                    })
                } catch (error) {
                    console.error('Error updating ID:', error)
                    toast({
                        title: 'Error',
                        description: 'Failed to update ID',
                        className: 'bg-red-500 text-white border-none',
                    })
                } finally {
                    setIsUpdating(false)
                }
            }

            return (
                <ImageCapture
                    onImageCapture={handleImageSelected}
                    buttonText={`Update ID ${imagePathNumber}`}
                    disabled={isUpdating}
                />
            )
        } catch (error) {
            console.error('Error in handleUpdateId:', error)
            toast({
                title: 'Error',
                description: 'Failed to process update',
                className: 'bg-red-500 text-white border-none',
            })
        }
    }

    const handleInputChange =
        (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
            // Remove all non-numeric characters
            const value = e.target.value.replace(/\D/g, '')

            let maxLength: number
            switch (field) {
                case 'telephone':
                    maxLength = 11
                    break
                case 'accountNo':
                    maxLength = 8
                    break
                case 'sortCode':
                    maxLength = 6
                    break
                default:
                    // For other fields, just use the original value without truncation
                    setFormValues((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                    }))
                    return
            }

            // Truncate the value based on the maxLength
            const truncatedValue = value.slice(0, maxLength)

            setFormValues((prev) => ({
                ...prev,
                [field]: truncatedValue,
            }))
        }

    useEffect(() => {
        setFormValues((prev) => ({
            ...prev,
            code: prev.fullName.toUpperCase(),
        }))
    }, [formValues.fullName])

    return (
        <div className="container mx-auto p-4 max-w-2xl bg-white h-full">
            <Tabs defaultValue="newaccount" className="w-[400px] h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="newaccount">New Account</TabsTrigger>
                    <TabsTrigger value="updateid">Update ID</TabsTrigger>
                </TabsList>
                <TabsContent value="newaccount">
                    <Card className="p-6 space-y-6">
                        <h1 className="text-2xl font-bold text-center">
                            New Account Setup
                        </h1>

                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                ref={fileInputRef}
                                className="hidden"
                                capture="environment"
                            />

                            <div className="flex flex-col gap-4 items-center">
                                <Button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    variant="outline"
                                >
                                    <Camera className="mr-2 h-5 w-5" /> Take
                                    Photo
                                </Button>

                                {selectedImage && (
                                    <div className="relative w-full h-[200px]">
                                        <Image
                                            src={selectedImage}
                                            alt="Selected ID"
                                            fill
                                            className="object-contain rounded-lg"
                                        />
                                    </div>
                                )}

                                {selectedImage && (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Process ID'
                                        )}
                                    </Button>
                                )}
                            </div>

                            {error && (
                                <div className="text-red-500 text-center p-2">
                                    {error}
                                </div>
                            )}

                            {idData && (
                                <div className="space-y-4">
                                    <h2 className="font-semibold text-lg">
                                        Extracted Information:
                                    </h2>

                                    <div className="space-y-4">
                                        <TextField
                                            id="code"
                                            label="Code"
                                            variant="outlined"
                                            fullWidth
                                            value={formValues.code}
                                            onChange={handleInputChange('code')}
                                            placeholder="CODE"
                                            inputProps={{
                                                style: {
                                                    textTransform: 'uppercase',
                                                },
                                            }}
                                        />
                                        <TextField
                                            id="fullName"
                                            label="Full Name"
                                            variant="outlined"
                                            fullWidth
                                            value={formValues.fullName}
                                            onChange={handleInputChange(
                                                'fullName'
                                            )}
                                            placeholder="Full Name"
                                        />
                                        <TextField
                                            id="address"
                                            label="Address"
                                            variant="outlined"
                                            fullWidth
                                            value={formValues.firstLineAddress}
                                            onChange={handleInputChange(
                                                'firstLineAddress'
                                            )}
                                            placeholder="Address"
                                        />
                                        <div className="flex flex-row items-center w-full gap-2">
                                            <TextField
                                                id="postcode"
                                                label="Postcode"
                                                variant="outlined"
                                                fullWidth
                                                value={formValues.postcode}
                                                onChange={handleInputChange(
                                                    'postcode'
                                                )}
                                                placeholder="Postcode"
                                            />
                                            <TextField
                                                id="registration"
                                                label="Registration"
                                                variant="outlined"
                                                fullWidth
                                                value={formValues.registration
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, '')}
                                                onChange={(e) =>
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        registration:
                                                            e.target.value
                                                                .toUpperCase()
                                                                .replace(
                                                                    /[^A-Z0-9]/g,
                                                                    ''
                                                                ),
                                                    }))
                                                }
                                                placeholder="Registration"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="paymentType">
                                                Payment Type
                                            </Label>
                                            <select
                                                id="paymentType"
                                                value={formValues.paymentType}
                                                onChange={(e) =>
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        paymentType: e.target
                                                            .value as
                                                            | 'ACCINV'
                                                            | 'BACS'
                                                            | 'CHEQUE',
                                                    }))
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="ACCINV">
                                                    ACCINV
                                                </option>
                                                <option value="BACS">
                                                    BACS
                                                </option>
                                                <option value="CHEQUE">
                                                    CHEQUE
                                                </option>
                                            </select>
                                        </div>
                                        {formValues.paymentType === 'BACS' && (
                                            <>
                                                <TextField
                                                    id="telephone"
                                                    label="Telephone No"
                                                    variant="outlined"
                                                    fullWidth
                                                    type="tel"
                                                    inputMode="numeric"
                                                    inputProps={{
                                                        pattern: '[0-9]{11}',
                                                        maxLength: 11,
                                                    }}
                                                    value={formValues.telephone}
                                                    onChange={handleInputChange(
                                                        'telephone'
                                                    )}
                                                    placeholder="11 digit number"
                                                    error={
                                                        !!(
                                                            formValues.telephone &&
                                                            formValues.telephone
                                                                .length !== 11
                                                        )
                                                    }
                                                />

                                                <div className="flex flex-row space-x-2">
                                                    <TextField
                                                        id="accountNo"
                                                        label="Account No."
                                                        variant="outlined"
                                                        fullWidth
                                                        inputMode="numeric"
                                                        inputProps={{
                                                            pattern: '[0-9]*',
                                                        }}
                                                        value={
                                                            formValues.accountNo
                                                        }
                                                        onChange={handleInputChange(
                                                            'accountNo'
                                                        )}
                                                        placeholder="8 digit number"
                                                        error={
                                                            formValues.accountNo &&
                                                            formValues.accountNo
                                                                .length !== 8
                                                                ? true
                                                                : undefined
                                                        }
                                                    />

                                                    <TextField
                                                        id="sortCode"
                                                        label="Sort Code"
                                                        variant="outlined"
                                                        fullWidth
                                                        inputMode="numeric"
                                                        inputProps={{
                                                            pattern: '[0-9]*',
                                                        }}
                                                        value={
                                                            formValues.sortCode
                                                        }
                                                        onChange={handleInputChange(
                                                            'sortCode'
                                                        )}
                                                        placeholder="6 digit number"
                                                        error={
                                                            formValues.sortCode &&
                                                            formValues.sortCode
                                                                .length !== 6
                                                                ? true
                                                                : undefined
                                                        }
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <Button
                                            onClick={handleFormSubmit}
                                            disabled={
                                                !isFormValid() || isSubmitting
                                            }
                                            className="w-full mt-6"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </Button>
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
                <TabsContent value="updateid">
                    <Card className="p-6 space-y-6 h-full">
                        <h1 className="text-2xl font-bold text-center">
                            Update ID
                        </h1>
                        {!gettingCustomers &&
                        customers &&
                        customers.length > 0 ? (
                            <div className="space-y-4">
                                <TextField
                                    id="search"
                                    label="Search Customers"
                                    variant="outlined"
                                    fullWidth
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Type to search..."
                                    InputProps={{
                                        className: 'bg-white',
                                    }}
                                />

                                <ScrollArea className="h-[60vh] w-full rounded-md">
                                    {filteredCustomers.map((customer) => (
                                        <Popover key={customer.code}>
                                            <PopoverTrigger asChild>
                                                <Card
                                                    // Remove the onClick handler from here
                                                    className={`p-4 transition-colors cursor-pointer flex flex-row items-center ${
                                                        selectedCustomer &&
                                                        selectedCustomer.code ===
                                                            customer.code
                                                            ? 'bg-blue-50'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <button
                                                        // Add a button wrapper with the onClick handler
                                                        onClick={() => {
                                                            setSelectedCustomer(
                                                                (
                                                                    prevSelected
                                                                ) =>
                                                                    prevSelected &&
                                                                    prevSelected.code ===
                                                                        customer.code
                                                                        ? null
                                                                        : customer
                                                            )
                                                        }}
                                                        className="w-full flex flex-row items-center"
                                                        type="button"
                                                    >
                                                        <div className="mr-4">
                                                            <ChevronDown className="h-8 w-8" />
                                                        </div>
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className="font-medium">
                                                                {
                                                                    customer.fullName
                                                                }
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {
                                                                    customer.firstLineAddress
                                                                }
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {
                                                                    customer.postcode
                                                                }
                                                            </span>
                                                        </div>
                                                    </button>
                                                </Card>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                                <div className="grid gap-2">
                                                    <div className="gap-2 flex flex-row justify-evenly items-center">
                                                        <ImageCapture
                                                            onImageCapture={(
                                                                file
                                                            ) =>
                                                                handleUpdateId(
                                                                    customer,
                                                                    1
                                                                )
                                                            }
                                                            buttonText="Update ID 1"
                                                            disabled={
                                                                isUpdating
                                                            }
                                                        />
                                                        <ImageCapture
                                                            onImageCapture={(
                                                                file
                                                            ) =>
                                                                handleUpdateId(
                                                                    customer,
                                                                    2
                                                                )
                                                            }
                                                            buttonText="Update ID 2"
                                                            disabled={
                                                                isUpdating
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label>Code:</Label>
                                                            <span className="col-span-2">
                                                                {customer.code}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label>
                                                                Payment:
                                                            </Label>
                                                            <span className="col-span-2">
                                                                {
                                                                    customer.paymentType
                                                                }
                                                            </span>
                                                        </div>
                                                        {customer.telephone && (
                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <Label>
                                                                    Tel:
                                                                </Label>
                                                                <span className="col-span-2">
                                                                    {
                                                                        customer.telephone
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {customer.paymentType ===
                                                            'BACS' && (
                                                            <>
                                                                <div className="grid grid-cols-3 items-center gap-4">
                                                                    <Label>
                                                                        Account
                                                                        No:
                                                                    </Label>
                                                                    <span className="col-span-2">
                                                                        {
                                                                            customer.accountNo
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-3 items-center gap-4">
                                                                    <Label>
                                                                        Sort
                                                                        Code:
                                                                    </Label>
                                                                    <span className="col-span-2">
                                                                        {
                                                                            customer.sortCode
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <p>No customers found</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default NewAccount
