'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, Check, Camera } from 'lucide-react'
import { toast } from 'sonner'
import {
    startCamera,
    stopCamera,
    captureSquarePhoto,
    convertToJPEG,
} from '../utils/imageUtils'
import { useUploadThing } from '@/utils/uploadthing'

interface PhotoUploaderProps {
    onPhotoCapture: (url: string) => void
    disabled?: boolean
}

interface PhotoStatus {
    id: string
    isProcessing: boolean
    isUploading: boolean
    isDone: boolean
}

export function PhotoUploader({
    onPhotoCapture,
    disabled,
}: PhotoUploaderProps) {
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [isCameraInitializing, setIsCameraInitializing] = useState(false)
    const [isProcessingCapture, setIsProcessingCapture] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [isProcessingBatch, setIsProcessingBatch] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Initialize UploadThing client
    const { startUpload } = useUploadThing('ebayPhotos')

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

    const handlePhotoChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files
        if (!files) return

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
                    // Start upload immediately and await the result
                    try {
                        const uploadResponse = await startUpload([
                            processedFile,
                        ])
                        const uploadResult = uploadResponse?.[0]

                        if (!uploadResult?.url) {
                            throw new Error('Upload failed - no URL received')
                        }

                        onPhotoCapture(uploadResult.url)
                        toast.success('Photo uploaded successfully')
                    } catch (error) {
                        toast.error(`Failed to upload ${file.name}`)
                    }
                } else {
                    toast.error(`Failed to process ${file.name}`)
                }
            } catch (error) {
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

            // Close camera dialog immediately
            handleCameraClose()

            // Start upload immediately and await the result
            try {
                const uploadResponse = await startUpload([capturedFile])
                const uploadResult = uploadResponse?.[0]

                if (!uploadResult?.url) {
                    throw new Error('Upload failed - no URL received')
                }

                onPhotoCapture(uploadResult.url)
                toast.success('Photo uploaded successfully')
            } catch (error) {
                toast.error('Failed to upload photo')
            }
        } catch (error) {
            toast.error('Failed to capture photo')
        } finally {
            setIsProcessingCapture(false)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
                    onClick={() => setIsCameraOpen(true)}
                    disabled={disabled}
                >
                    <Camera className="h-5 w-5 text-white" />
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

            {isProcessingBatch && (
                <div className="flex items-center gap-2 text-blue-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing photos...</span>
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
