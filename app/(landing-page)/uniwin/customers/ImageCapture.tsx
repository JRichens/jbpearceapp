import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

interface ImageCaptureProps {
    onImageCapture: (file: File) => void
    buttonText: string
    disabled?: boolean
}

export const ImageCapture = ({
    onImageCapture,
    buttonText,
    disabled,
}: ImageCaptureProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            // Convert HEIC to JPEG if needed
            const convertedFile = await ensureJPEGFormat(file)
            onImageCapture(convertedFile)
        }
    }

    const ensureJPEGFormat = async (file: File): Promise<File> => {
        // If it's already JPEG, return as is
        if (file.type === 'image/jpeg') {
            return file
        }

        // Convert to JPEG using canvas
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx?.drawImage(img, 0, 0)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const convertedFile = new File(
                                [blob],
                                'converted.jpg',
                                {
                                    type: 'image/jpeg',
                                }
                            )
                            resolve(convertedFile)
                        } else {
                            reject(new Error('Conversion failed'))
                        }
                    },
                    'image/jpeg',
                    0.8
                )
            }

            img.onerror = () => reject(new Error('Image load failed'))
            img.src = URL.createObjectURL(file)
        })
    }

    return (
        <>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="hidden"
                capture="environment"
            />
            <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                variant="outline"
                className="flex items-center gap-2"
            >
                <Camera className="h-5 w-5" />
                {buttonText}
            </Button>
        </>
    )
}
