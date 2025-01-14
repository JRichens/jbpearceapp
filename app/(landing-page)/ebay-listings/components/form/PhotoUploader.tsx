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
import { useUploadThing } from '@/utils/uploadthing'

// Rest of the file remains unchanged
interface PhotoUploaderProps {
    photos: File[]
    photosPreviews: string[]
    uploadedPhotoUrls: string[]
    onPhotosChange: (
        photos: File[],
        previews: string[],
        uploadedUrls: string[],
        isUploading: boolean
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

    // Initialize UploadThing client
    const { startUpload } = useUploadThing('ebayPhotos')

    // Refs to track latest state
    const latestPhotos = useRef<File[]>(photos)
    const latestPreviews = useRef<string[]>(photosPreviews)
    const latestUrls = useRef<string[]>(uploadedPhotoUrls)
    const activeUploads = useRef<number>(0)

    // Update refs when props change
    useEffect(() => {
        latestPhotos.current = photos
        latestPreviews.current = photosPreviews
        latestUrls.current = uploadedPhotoUrls
    }, [photos, photosPreviews, uploadedPhotoUrls])

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
                    if (!videoRef.current) return

                    const stream = await startCamera(videoRef)

                    if (!mounted) {
                        if (stream) stopCamera(stream)
                        return
                    }

                    if (stream) {
                        streamRef.current = stream
                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => {
                                if (!mounted) return
                                videoRef.current?.play().catch(() => {
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
                    if (mounted) setIsCameraInitializing(false)
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
                (_, index) => index < photos.length
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

    const uploadPhoto = async (file: File): Promise<string | null> => {
        try {
            // Use toast for important status updates that should be visible in production
            toast.info(`Uploading ${file.name}...`)

            if (!startUpload) {
                throw new Error('Upload client not initialized')
            }

            // Log the start of upload
            console.log('[Upload] Starting upload:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                timestamp: new Date().toISOString(),
            })

            const uploadResponse = await startUpload([file])

            // Log the raw upload response
            console.log('[Upload] Raw response:', {
                response: uploadResponse,
                timestamp: new Date().toISOString(),
            })

            if (!uploadResponse || uploadResponse.length === 0) {
                throw new Error('Upload failed - no response from server')
            }

            const uploadResult = uploadResponse[0]
            console.log('[Upload] Processing result:', uploadResult)

            // Try to get the URL from either the direct response or construct it from the key
            let finalUrl: string
            if (uploadResult.url) {
                console.log('[Upload] Using direct URL:', uploadResult.url)
                finalUrl = uploadResult.url
            } else if (uploadResult.key) {
                finalUrl = `https://utfs.io/f/${uploadResult.key}`
                console.log('[Upload] Constructed URL from key:', finalUrl)
            } else {
                throw new Error('Upload failed - no URL or key in response')
            }

            // Add a longer delay in production to ensure processing completes
            const delay = process.env.NODE_ENV === 'production' ? 3000 : 1000
            await new Promise((resolve) => setTimeout(resolve, delay))

            // Log success and return the URL
            console.log('[Upload] Successfully completed:', {
                fileName: file.name,
                finalUrl,
                timestamp: new Date().toISOString(),
            })

            toast.success(`${file.name} uploaded successfully`)
            return finalUrl
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            console.error('Upload error:', {
                error,
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
            })

            // Provide user feedback based on error type
            if (errorMessage.includes('network')) {
                toast.error(
                    'Network error during upload. Please check your connection.'
                )
            } else {
                toast.error('Upload failed. Please try again.')
            }

            throw error
        }
    }

    const updatePhotoState = (index: number, uploadedUrl: string | null) => {
        console.log('Updating photo state:', {
            index,
            uploadedUrl,
            activeUploads: activeUploads.current,
        })

        const currentPhotos = [...latestPhotos.current]
        const currentPreviews = [...latestPreviews.current]
        const currentUrls = [...latestUrls.current]

        // Decrement active uploads first
        activeUploads.current = Math.max(0, activeUploads.current - 1)
        const isStillUploading = activeUploads.current > 0

        console.log('Upload status:', {
            remainingUploads: activeUploads.current,
            isStillUploading,
        })

        if (uploadedUrl) {
            currentUrls[index] = uploadedUrl

            // Update photo status first
            setPhotoStatuses((prev) =>
                prev.map((status, idx) =>
                    idx === index
                        ? { ...status, isUploading: false, isDone: true }
                        : status
                )
            )

            // Then notify parent of changes
            onPhotosChange(
                currentPhotos,
                currentPreviews,
                currentUrls,
                isStillUploading
            )

            console.log('Photo upload completed:', {
                index,
                url: uploadedUrl,
                totalUrls: currentUrls.length,
            })
        } else {
            // Update status to show failure
            setPhotoStatuses((prev) =>
                prev.map((status, idx) =>
                    idx === index
                        ? { ...status, isUploading: false, isDone: false }
                        : status
                )
            )

            // Notify parent of changes
            onPhotosChange(
                currentPhotos,
                currentPreviews,
                currentUrls,
                isStillUploading
            )

            console.log('Photo upload failed:', { index })
        }
    }

    const addPhotoToState = (processedFile: File, previewUrl: string) => {
        const newPhotos = [...latestPhotos.current, processedFile]
        const newPreviews = [...latestPreviews.current, previewUrl]
        const newUrls = [...latestUrls.current, '']
        const newIndex = newPhotos.length - 1

        activeUploads.current += 1
        onPhotosChange(newPhotos, newPreviews, newUrls, true)

        setPhotoStatuses((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                isProcessing: false,
                isUploading: true,
                isDone: false,
            },
        ])

        return newIndex
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
                    const newIndex = addPhotoToState(processedFile, previewUrl)

                    // Handle upload in background
                    uploadPhoto(processedFile)
                        .then((uploadedUrl) => {
                            updatePhotoState(newIndex, uploadedUrl)
                            if (!uploadedUrl) {
                                toast.error(`Failed to upload ${file.name}`)
                            }
                        })
                        .catch((error) => {
                            console.error('Upload error:', error)
                            toast.error(`Failed to upload ${file.name}`)
                            updatePhotoState(newIndex, null)
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
            if (!capturedFile) {
                toast.error('Failed to capture photo')
                return
            }

            const previewUrl = URL.createObjectURL(capturedFile)
            const processedFile = await processPhoto(capturedFile)
            if (!processedFile) {
                URL.revokeObjectURL(previewUrl)
                toast.error('Failed to process photo')
                return
            }

            const newIndex = addPhotoToState(processedFile, previewUrl)

            // Close camera dialog immediately
            handleCameraClose()

            // Start upload immediately and await the result
            try {
                const uploadedUrl = await uploadPhoto(processedFile)
                if (uploadedUrl) {
                    updatePhotoState(newIndex, uploadedUrl)
                    toast.success('Photo uploaded successfully')
                } else {
                    toast.error('Failed to upload photo')
                    updatePhotoState(newIndex, null)
                }
            } catch (error) {
                console.error('Upload error:', error)
                toast.error('Failed to upload photo')
                updatePhotoState(newIndex, null)
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
        const newUploadedUrls = [...uploadedPhotoUrls]

        // Cleanup the preview URL
        URL.revokeObjectURL(newPreviews[index])

        // Remove the items at the specified index
        newPhotos.splice(index, 1)
        newPreviews.splice(index, 1)
        newUploadedUrls.splice(index, 1)

        // Filter out any undefined or empty values from uploadedUrls
        const compactedUrls = newUploadedUrls.filter(
            (url) => url && url.trim() !== ''
        )

        // Decrement active uploads if we're removing an uploading photo
        if (index < photos.length && !uploadedPhotoUrls[index]) {
            activeUploads.current = Math.max(0, activeUploads.current - 1)
        }

        onPhotosChange(
            newPhotos,
            newPreviews,
            compactedUrls,
            activeUploads.current > 0
        )
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
                    if (!open) handleCameraClose()
                    else setIsCameraOpen(true)
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
                                            : 'Processing photo...'}
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
