'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { MAX_PHOTOS } from '../../types/listingTypes'
import {
    startCamera,
    stopCamera,
    captureSquarePhoto,
    convertToJPEG,
} from '../../utils/imageUtils'

interface PhotoUploaderProps {
    photos: File[]
    photosPreviews: string[]
    uploadedPhotoUrls: string[]
    onPhotosChange: (
        photos: File[],
        previews: string[],
        uploadedUrls: string[]
    ) => void
    isLoading: boolean
    isUploadingPhotos: boolean
}

interface PhotoStatus {
    id: string
    isProcessing: boolean
    isUploading: boolean
    isDone: boolean
}

export function PhotoUploader({
    photos,
    photosPreviews,
    uploadedPhotoUrls,
    onPhotosChange,
    isLoading,
    isUploadingPhotos,
}: PhotoUploaderProps) {
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [isCameraInitializing, setIsCameraInitializing] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [photoStatuses, setPhotoStatuses] = useState<PhotoStatus[]>([])
    const [isProcessingBatch, setIsProcessingBatch] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const handleCameraClose = () => {
        stopCamera(streamRef.current)
        setIsCameraOpen(false)
        setCameraError(null)
        setIsCameraInitializing(false)
    }

    useEffect(() => {
        let mounted = true
        let initTimeout: NodeJS.Timeout

        async function initializeCamera() {
            if (!isCameraOpen) return

            setIsCameraInitializing(true)
            setCameraError(null)

            initTimeout = setTimeout(async () => {
                try {
                    if (!videoRef.current) {
                        // console.error('Video element not found, retrying...')
                        return
                    }

                    const stream = await startCamera(videoRef)

                    if (!mounted) {
                        if (stream) {
                            stopCamera(stream)
                        }
                        return
                    }

                    if (stream) {
                        streamRef.current = stream

                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => {
                                if (!mounted) return
                                videoRef.current?.play().catch((error) => {
                                    // console.error('Error playing video:', error)
                                    setCameraError(
                                        'Failed to start video preview'
                                    )
                                })
                            }
                        }
                    } else {
                        throw new Error('Failed to initialize camera stream')
                    }
                } catch (error) {
                    if (!mounted) return
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'Failed to initialize camera'
                    setCameraError(errorMessage)
                    toast.error(errorMessage)
                } finally {
                    if (mounted) {
                        setIsCameraInitializing(false)
                    }
                }
            }, 100)
        }

        initializeCamera()

        return () => {
            mounted = false
            clearTimeout(initTimeout)
            stopCamera(streamRef.current)
        }
    }, [isCameraOpen])

    useEffect(() => {
        setPhotoStatuses((prevStatuses) => {
            const currentStatuses = prevStatuses.filter(
                (status, index) => index < photos.length
            )

            while (currentStatuses.length < photos.length) {
                currentStatuses.push({
                    id: Math.random().toString(36).substr(2, 9),
                    isProcessing: false,
                    isUploading: false,
                    isDone: false,
                })
            }

            return currentStatuses
        })
    }, [photos.length])

    useEffect(() => {
        if (isLoading) {
            setPhotoStatuses((prevStatuses) =>
                prevStatuses.map((status) => ({
                    ...status,
                    isUploading: true,
                    isDone: false,
                }))
            )
        } else {
            setPhotoStatuses((prevStatuses) =>
                prevStatuses.map((status) => ({
                    ...status,
                    isUploading: false,
                    isDone: true,
                }))
            )
        }
    }, [isLoading])

    // Helper function to check and process file size
    const processPhoto = async (file: File): Promise<File | null> => {
        // console.log(
        //     `Processing photo: ${file.name}, size: ${(
        //         file.size /
        //         (1024 * 1024)
        //     ).toFixed(2)}MB`
        // )

        // Check if file is too large (over 20MB)
        const MAX_FILE_SIZE = 20 * 1024 * 1024
        if (file.size > MAX_FILE_SIZE) {
            // console.log(
            //     `File ${file.name} exceeds size limit, will attempt compression`
            // )
            try {
                const jpegFile = await convertToJPEG(file)
                if (jpegFile.size > MAX_FILE_SIZE) {
                    throw new Error(
                        `File ${file.name} is still too large after compression`
                    )
                }
                return jpegFile
            } catch (error) {
                // console.error(
                //     `Failed to process large file ${file.name}:`,
                //     error
                // )
                return null
            }
        }

        // If it's already a JPEG and under size limit, return as is
        if (file.type === 'image/jpeg' && file.size <= MAX_FILE_SIZE) {
            return file
        }

        // Otherwise convert to JPEG for consistency
        try {
            return await convertToJPEG(file)
        } catch (error) {
            // console.error(`Failed to convert ${file.name} to JPEG:`, error)
            return null
        }
    }

    const uploadPhoto = async (
        file: File,
        index: number
    ): Promise<string | null> => {
        try {
            const formData = new FormData()
            formData.append('photos', file)

            const response = await fetch('/api/ebay-listings/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload photo')
            }

            const data = await response.json()
            return data.url
        } catch (error) {
            console.error('Error uploading photo:', error)
            return null
        }
    }

    const handlePhotoChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files
        if (!files) return

        if (photos.length + files.length > MAX_PHOTOS) {
            toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
            return
        }

        const totalSize = Array.from(files).reduce(
            (acc, file) => acc + file.size,
            0
        )
        const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB total limit
        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error(
                'Total size of selected photos is too large. Please select fewer or smaller photos.'
            )
            return
        }

        setIsProcessingBatch(true)
        const convertedFiles: File[] = []
        const newPreviews: string[] = []
        const newUploadedUrls: string[] = []
        const errors: string[] = []

        try {
            const fileArray = Array.from(files)
            const processPromises = fileArray.map(async (file, index) => {
                if (!file.type.startsWith('image/')) {
                    errors.push(`${file.name} is not an image file`)
                    return
                }

                setPhotoStatuses((prev) => [
                    ...prev,
                    {
                        id: file.name,
                        isProcessing: true,
                        isUploading: false,
                        isDone: false,
                    },
                ])

                try {
                    const processedFile = await processPhoto(file)
                    if (processedFile) {
                        // Create preview immediately
                        const previewUrl = URL.createObjectURL(processedFile)

                        // Start upload
                        setPhotoStatuses((prev) => {
                            const newStatuses = [...prev]
                            const statusIndex = photos.length + index
                            if (newStatuses[statusIndex]) {
                                newStatuses[statusIndex].isProcessing = false
                                newStatuses[statusIndex].isUploading = true
                            }
                            return newStatuses
                        })

                        // Upload the processed file
                        const uploadedUrl = await uploadPhoto(
                            processedFile,
                            index
                        )

                        if (uploadedUrl) {
                            convertedFiles.push(processedFile)
                            newPreviews.push(previewUrl)
                            newUploadedUrls.push(uploadedUrl)

                            setPhotoStatuses((prev) => {
                                const newStatuses = [...prev]
                                const statusIndex = photos.length + index
                                if (newStatuses[statusIndex]) {
                                    newStatuses[statusIndex].isUploading = false
                                    newStatuses[statusIndex].isDone = true
                                }
                                return newStatuses
                            })
                        } else {
                            errors.push(`Failed to upload ${file.name}`)
                            URL.revokeObjectURL(previewUrl)
                        }
                    } else {
                        errors.push(`Failed to process ${file.name}`)
                    }
                } catch (error) {
                    errors.push(`Failed to process ${file.name}`)
                }
            })

            await Promise.all(processPromises)

            if (errors.length > 0) {
                toast.error(
                    `Some photos couldn't be processed: ${errors.join(', ')}`
                )
            }

            if (convertedFiles.length > 0) {
                onPhotosChange(
                    [...photos, ...convertedFiles],
                    [...photosPreviews, ...newPreviews],
                    [...uploadedPhotoUrls, ...newUploadedUrls]
                )
            }
        } catch (error) {
            toast.error('Error processing images')
            console.error('Error processing images:', error)
        } finally {
            setIsProcessingBatch(false)
        }
    }

    const capturePhoto = async () => {
        if (!videoRef.current || !videoRef.current.videoWidth) {
            toast.error('Camera not ready yet. Please wait a moment.')
            return
        }

        try {
            const capturedFile = await captureSquarePhoto(videoRef, canvasRef)
            if (capturedFile) {
                const previewUrl = URL.createObjectURL(capturedFile)
                // Process and upload the captured photo
                const processedFile = await processPhoto(capturedFile)
                if (processedFile) {
                    setPhotoStatuses((prev) => [
                        ...prev,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            isProcessing: false,
                            isUploading: true,
                            isDone: false,
                        },
                    ])

                    const uploadedUrl = await uploadPhoto(
                        processedFile,
                        photos.length
                    )
                    if (uploadedUrl) {
                        onPhotosChange(
                            [...photos, processedFile],
                            [...photosPreviews, previewUrl],
                            [...uploadedPhotoUrls, uploadedUrl]
                        )
                        setPhotoStatuses((prev) => {
                            const newStatuses = [...prev]
                            if (newStatuses[photos.length]) {
                                newStatuses[photos.length].isUploading = false
                                newStatuses[photos.length].isDone = true
                            }
                            return newStatuses
                        })
                    } else {
                        URL.revokeObjectURL(previewUrl)
                        toast.error('Failed to upload photo')
                    }
                }
                handleCameraClose()
                toast.success('Photo captured successfully')
            } else {
                toast.error('Failed to capture photo')
            }
        } catch (error) {
            // console.error('Error capturing photo:', error)
            toast.error('Failed to capture photo')
        }
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...photos]
        const newPreviews = [...photosPreviews]
        URL.revokeObjectURL(newPreviews[index])
        newPhotos.splice(index, 1)
        newPreviews.splice(index, 1)
        // Remove the corresponding uploaded URL
        const newUploadedUrls = [...uploadedPhotoUrls]
        newUploadedUrls.splice(index, 1)
        onPhotosChange(newPhotos, newPreviews, newUploadedUrls)
    }

    return (
        <div className="space-y-2">
            <Label>
                Photos * ({photos.length}/{MAX_PHOTOS})
            </Label>

            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    className="w-full"
                    onClick={() => setIsCameraOpen(true)}
                    disabled={photos.length >= MAX_PHOTOS || isLoading}
                >
                    Take Photo
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        document.getElementById('fileInput')?.click()
                    }
                    disabled={photos.length >= MAX_PHOTOS || isLoading}
                >
                    Select Multiple Photos
                </Button>
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                />
            </div>

            <div className="flex flex-col gap-2 text-sm">
                <span className="text-gray-500">
                    Take photos one by one or select multiple photos. Up to{' '}
                    {MAX_PHOTOS} photos allowed.
                </span>
                {(isProcessingBatch || isLoading) && (
                    <div className="flex items-center gap-2 text-blue-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                            {isProcessingBatch
                                ? 'Processing photos...'
                                : 'Uploading photos in batches...'}
                        </span>
                    </div>
                )}
            </div>

            {photosPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {photosPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-md"
                            />
                            {photoStatuses[index] && (
                                <>
                                    {(photoStatuses[index].isProcessing ||
                                        photoStatuses[index].isUploading) && (
                                        <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-white mb-2" />
                                            <span className="text-white text-xs">
                                                {photoStatuses[index]
                                                    .isProcessing
                                                    ? 'Processing...'
                                                    : 'Uploading...'}
                                            </span>
                                        </div>
                                    )}
                                    {photoStatuses[index].isDone &&
                                        !photoStatuses[index].isProcessing &&
                                        !photoStatuses[index].isUploading && (
                                            <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                </>
                            )}
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                onClick={() => removePhoto(index)}
                                disabled={isLoading}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                open={isCameraOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCameraClose()
                    } else {
                        setIsCameraOpen(true)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[600px] p-0">
                    <div className="relative">
                        <div className="relative aspect-square w-full bg-black overflow-hidden">
                            {isCameraInitializing && (
                                <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-10">
                                    Initializing camera...
                                </div>
                            )}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50 z-10 p-4">
                                    <p className="text-center mb-4">
                                        {cameraError}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCameraClose}
                                    >
                                        Close Camera
                                    </Button>
                                </div>
                            )}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                            />
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                <div className="border-r border-white/30" />
                                <div className="border-r border-white/30" />
                                <div />
                                <div className="border-r border-t border-white/30" />
                                <div className="border-r border-t border-white/30" />
                                <div className="border-t border-white/30" />
                                <div className="border-r border-t border-white/30" />
                                <div className="border-r border-t border-white/30" />
                                <div className="border-t border-white/30" />
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <Button
                                type="button"
                                className="rounded-full w-16 h-16 bg-white"
                                onClick={capturePhoto}
                                disabled={isCameraInitializing || !!cameraError}
                            >
                                <div className="rounded-full w-14 h-14 border-2 border-black" />
                            </Button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </DialogContent>
            </Dialog>
        </div>
    )
}
