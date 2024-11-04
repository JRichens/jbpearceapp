'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { askClaudeId } from '@/actions/claude-ai/askClaudeId'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

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
}

const NewAccount = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [idData, setIdData] = useState<IdData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
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
    const isFormValid = (): boolean => {
        return (
            formValues.code.length > 0 &&
            formValues.fullName.length > 0 &&
            formValues.firstLineAddress.length > 0 &&
            formValues.postcode.length > 0 &&
            formValues.registration.length > 0 &&
            formValues.telephone.length === 11 &&
            ((formValues.paymentType === 'BACS' &&
                formValues.accountNo.length === 8 &&
                formValues.sortCode.length === 6) ||
                formValues.paymentType !== 'BACS')
        )
    }

    const handleFormSubmit = async () => {
        try {
            const response = await fetch(
                'https://genuine-calf-newly.ngrok-free.app/customers',
                {
                    method: 'POST',
                    headers: {
                        'ngrok-skip-browser-warning': '69420',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: formValues.code,
                        name: formValues.fullName,
                        address: formValues.firstLineAddress,
                        postcode: formValues.postcode,
                        reg: formValues.registration,
                        paymenttype: formValues.paymentType,
                        tel: formValues.telephone,
                        account: formValues.accountNo,
                        sortcode: formValues.sortCode,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            // Handle successful submission
            // You might want to show a success message or redirect
        } catch (error) {
            setError('Failed to submit form')
            console.error('Failed to submit form:', error)
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

    const handleInputChange =
        (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
            if (field === 'telephone') {
                // Remove all non-numeric characters
                const value = e.target.value.replace(/\D/g, '')
                // Limit to 11 digits
                const truncatedValue = value.slice(0, 11)

                setFormValues((prev) => ({
                    ...prev,
                    [field]: truncatedValue,
                }))
            } else {
                // Handle other fields
                setFormValues((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                }))
            }
        }

    useEffect(() => {
        setFormValues((prev) => ({
            ...prev,
            code: prev.fullName.toUpperCase(),
        }))
    }, [formValues.fullName])

    return (
        <div className="container mx-auto p-4 max-w-2xl">
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
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                        >
                            Select ID Image
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
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={formValues.code}
                                        onChange={handleInputChange('code')}
                                        placeholder="CODE"
                                        className="uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={formValues.fullName}
                                        onChange={handleInputChange('fullName')}
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={formValues.firstLineAddress}
                                        onChange={handleInputChange(
                                            'firstLineAddress'
                                        )}
                                        placeholder="Address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postcode">Postcode</Label>
                                    <Input
                                        id="postcode"
                                        value={formValues.postcode}
                                        onChange={handleInputChange('postcode')}
                                        placeholder="Postcode"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="registration">
                                        Registration
                                    </Label>
                                    <Input
                                        id="registration"
                                        value={formValues.registration
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, '')}
                                        onChange={(e) =>
                                            setFormValues((prev) => ({
                                                ...prev,
                                                registration: e.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, ''),
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
                                                paymentType: e.target.value as
                                                    | 'ACCINV'
                                                    | 'BACS'
                                                    | 'CHEQUE',
                                            }))
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="ACCINV">ACCINV</option>
                                        <option value="BACS">BACS</option>
                                        <option value="CHEQUE">CHEQUE</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telephone">
                                        Telephone No
                                    </Label>
                                    <Input
                                        id="telephone"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]{11}"
                                        maxLength={11}
                                        value={formValues.telephone}
                                        onChange={handleInputChange(
                                            'telephone'
                                        )}
                                        placeholder="11 digit number"
                                        // Optional: Add validation styling
                                        className={`${
                                            formValues.telephone &&
                                            formValues.telephone.length !== 11
                                                ? 'border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-row space-x-2">
                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor="accountNo">
                                            Account No.
                                        </Label>
                                        <Input
                                            id="accountNo"
                                            type="text" // Changed to text for better control
                                            inputMode="numeric" // Shows numeric keyboard on mobile
                                            pattern="[0-9]*"
                                            value={formValues.accountNo}
                                            onChange={handleInputChange(
                                                'accountNo'
                                            )}
                                            placeholder="8 digit number"
                                            className={`${
                                                formValues.accountNo &&
                                                formValues.accountNo.length !==
                                                    8
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : ''
                                            }`}
                                        />
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor="sortCode">
                                            Sort Code
                                        </Label>
                                        <Input
                                            id="sortCode"
                                            type="text" // Changed to text for better control
                                            inputMode="numeric" // Shows numeric keyboard on mobile
                                            pattern="[0-9]*"
                                            value={formValues.sortCode}
                                            onChange={handleInputChange(
                                                'sortCode'
                                            )}
                                            placeholder="6 digit number"
                                            className={`${
                                                formValues.sortCode &&
                                                formValues.sortCode.length !== 6
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleFormSubmit}
                                    disabled={!isFormValid()}
                                    className="w-full mt-6"
                                >
                                    Submit Form
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default NewAccount
