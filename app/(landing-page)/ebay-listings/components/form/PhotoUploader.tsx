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
    const [isProcessingCapture, setIsProcessingCapture] = useState(false)
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
        setIsProcessingCapture(false)
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

    const processPhoto = async (file: File): Promise<File | null> => {
        const MAX_FILE_SIZE = 20 * 1024 * 1024
        if (file.size > MAX_FILE_SIZE) {
            try {
                const jpegFile = await convertToJPEG(file)
                if (jpegFile.size > MAX_FILE_SIZE) {
                    throw new Error(
                        `File ${file.name} is still too large after compression`
                    )
                }
                return jpegFile
            } catch (error) {
                return null
            }
        }

        if (file.type === 'image/jpeg' && file.size <= MAX_FILE_SIZE) {
            return file
        }

        try {
            return await convertToJPEG(file)
        } catch (error) {
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
        const fileArray = Array.from(files)

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i]
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`)
                continue
            }

            try {
                const processedFile = await processPhoto(file)
                if (processedFile) {
                    const previewUrl = URL.createObjectURL(processedFile)
                    const newIndex = photos.length + i

                    // Add to grid immediately with processing state
                    onPhotosChange(
                        [...photos, processedFile],
                        [...photosPreviews, previewUrl],
                        [...uploadedPhotoUrls, ''] // Empty URL until upload completes
                    )

                    // Update status to show uploading
                    setPhotoStatuses((prev) => [
                        ...prev,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            isProcessing: false,
                            isUploading: true,
                            isDone: false,
                        },
                    ])

                    // Handle upload in background
                    uploadPhoto(processedFile, newIndex)
                        .then((uploadedUrl) => {
                            if (uploadedUrl) {
                                onPhotosChange(
                                    photos,
                                    photosPreviews,
                                    uploadedPhotoUrls.map((url, idx) =>
                                        idx === newIndex ? uploadedUrl : url
                                    )
                                )
                                setPhotoStatuses((prev) =>
                                    prev.map((status, idx) =>
                                        idx === newIndex
                                            ? {
                                                  ...status,
                                                  isUploading: false,
                                                  isDone: true,
                                              }
                                            : status
                                    )
                                )
                            } else {
                                throw new Error('Failed to upload photo')
                            }
                        })
                        .catch((error) => {
                            console.error('Upload error:', error)
                            toast.error(`Failed to upload ${file.name}`)
                            setPhotoStatuses((prev) =>
                                prev.map((status, idx) =>
                                    idx === newIndex
                                        ? {
                                              ...status,
                                              isUploading: false,
                                              isDone: false,
                                          }
                                        : status
                                )
                            )
                        })
                } else {
                    toast.error(`Failed to process ${file.name}`)
                }
            } catch (error) {
                console.error('Processing error:', error)
                toast.error(`Failed to process ${file.name}`)
            }
        }

        setIsProcessingBatch(false)
    }

    const capturePhoto = async () => {
        if (!videoRef.current || !videoRef.current.videoWidth) {
            toast.error('Camera not ready yet. Please wait a moment.')
            return
        }

        try {
            setIsProcessingCapture(true)
            const capturedFile = await captureSquarePhoto(videoRef, canvasRef)
            if (capturedFile) {
                const previewUrl = URL.createObjectURL(capturedFile)
                const processedFile = await processPhoto(capturedFile)
                if (processedFile) {
                    // Add the photo to the grid immediately with processing state
                    const newIndex = photos.length
                    onPhotosChange(
                        [...photos, processedFile],
                        [...photosPreviews, previewUrl],
                        [...uploadedPhotoUrls, ''] // Empty URL until upload completes
                    )

                    // Close camera dialog immediately
                    handleCameraClose()

                    // Update status to show processing
                    setPhotoStatuses((prev) => [
                        ...prev,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            isProcessing: false,
                            isUploading: true,
                            isDone: false,
                        },
                    ])

                    // Handle upload in the background
                    uploadPhoto(processedFile, newIndex)
                        .then((uploadedUrl) => {
                            if (uploadedUrl) {
                                // Update the uploaded URL
                                onPhotosChange(
                                    photos,
                                    photosPreviews,
                                    uploadedPhotoUrls.map((url, i) =>
                                        i === newIndex ? uploadedUrl : url
                                    )
                                )
                                // Update status to show completion
                                setPhotoStatuses((prev) =>
                                    prev.map((status, i) =>
                                        i === newIndex
                                            ? {
                                                  ...status,
                                                  isUploading: false,
                                                  isDone: true,
                                              }
                                            : status
                                    )
                                )
                                toast.success('Photo uploaded successfully')
                            } else {
                                throw new Error('Failed to upload photo')
                            }
                        })
                        .catch((error) => {
                            console.error('Upload error:', error)
                            toast.error('Failed to upload photo')
                            // Update status to show error
                            setPhotoStatuses((prev) =>
                                prev.map((status, i) =>
                                    i === newIndex
                                        ? {
                                              ...status,
                                              isUploading: false,
                                              isDone: false,
                                          }
                                        : status
                                )
                            )
                        })
                } else {
                    URL.revokeObjectURL(previewUrl)
                    toast.error('Failed to process photo')
                }
            } else {
                toast.error('Failed to capture photo')
            }
        } catch (error) {
            console.error('Capture error:', error)
            toast.error('Failed to capture photo')
        } finally {
            setIsProcessingCapture(false)
        }
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...photos]
        const newPreviews = [...photosPreviews]
        URL.revokeObjectURL(newPreviews[index])
        newPhotos.splice(index, 1)
        newPreviews.splice(index, 1)
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
                            {(isCameraInitializing || isProcessingCapture) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50 z-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-white mb-2" />
                                    <span>
                                        {isCameraInitializing
                                            ? 'Initializing camera...'
                                            : 'Processing and uploading photo...'}
                                    </span>
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
                                disabled={
                                    isCameraInitializing ||
                                    isProcessingCapture ||
                                    !!cameraError
                                }
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
