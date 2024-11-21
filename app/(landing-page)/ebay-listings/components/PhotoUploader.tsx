'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MAX_PHOTOS } from './types'
import {
    startCamera,
    stopCamera,
    captureSquarePhoto,
    convertToJPEG,
} from './utils'

interface PhotoUploaderProps {
    photos: File[]
    photosPreviews: string[]
    onPhotosChange: (photos: File[], previews: string[]) => void
    isLoading: boolean
}

export function PhotoUploader({
    photos,
    photosPreviews,
    onPhotosChange,
    isLoading,
}: PhotoUploaderProps) {
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        if (isCameraOpen) {
            startCamera(videoRef).then((stream) => {
                streamRef.current = stream
            })
        } else {
            stopCamera(streamRef.current)
        }
        return () => stopCamera(streamRef.current)
    }, [isCameraOpen])

    const handlePhotoChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files
        if (!files) return

        if (photos.length + files.length > MAX_PHOTOS) {
            toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
            return
        }

        const convertedFiles: File[] = []
        const newPreviews: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image file`)
                    continue
                }

                const jpegFile = await convertToJPEG(file)
                convertedFiles.push(jpegFile)

                const previewUrl = URL.createObjectURL(jpegFile)
                newPreviews.push(previewUrl)
            }

            onPhotosChange(
                [...photos, ...convertedFiles],
                [...photosPreviews, ...newPreviews]
            )
        } catch (error) {
            toast.error('Error processing images')
            console.error('Error processing images:', error)
        }
    }

    const capturePhoto = async () => {
        const capturedFile = await captureSquarePhoto(videoRef, canvasRef)
        if (capturedFile) {
            const previewUrl = URL.createObjectURL(capturedFile)
            onPhotosChange(
                [...photos, capturedFile],
                [...photosPreviews, previewUrl]
            )
            setIsCameraOpen(false)
            toast.success('Photo captured successfully')
        } else {
            toast.error('Failed to capture photo')
        }
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...photos]
        const newPreviews = [...photosPreviews]
        URL.revokeObjectURL(newPreviews[index])
        newPhotos.splice(index, 1)
        newPreviews.splice(index, 1)
        onPhotosChange(newPhotos, newPreviews)
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

            <p className="text-sm text-gray-500">
                Take photos one by one or select multiple photos. Up to{' '}
                {MAX_PHOTOS} photos allowed.
            </p>

            {photosPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {photosPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-md"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                onClick={() => removePhoto(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Camera Dialog */}
            <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogContent className="sm:max-w-[600px] p-0">
                    <div className="relative">
                        <div className="relative aspect-square w-full bg-black overflow-hidden">
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
