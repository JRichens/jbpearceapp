// Function to convert image to JPEG format
export async function convertToJPEG(file: File | Blob): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const convertedFile = new File([blob], 'ebay.jpg', {
                            type: 'image/jpeg',
                        })
                        resolve(convertedFile)
                    } else {
                        reject(new Error('Failed to convert image'))
                    }
                },
                'image/jpeg',
                0.9
            )
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        img.src = URL.createObjectURL(file)
    })
}

export async function startCamera(
    videoRef: React.RefObject<HTMLVideoElement>
): Promise<MediaStream | null> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                aspectRatio: 1,
            },
        })

        if (videoRef.current) {
            videoRef.current.srcObject = stream
            return stream
        }
        return null
    } catch (error) {
        console.error('Error accessing camera:', error)
        throw new Error('Failed to access camera')
    }
}

export function stopCamera(stream: MediaStream | null) {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop())
    }
}

export async function captureSquarePhoto(
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
): Promise<File | null> {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const size = Math.min(video.videoWidth, video.videoHeight)

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)

    return new Promise((resolve) => {
        canvas.toBlob(
            async (blob) => {
                if (blob) {
                    try {
                        const jpegFile = await convertToJPEG(blob)
                        resolve(jpegFile)
                    } catch (error) {
                        console.error('Error processing captured photo:', error)
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            },
            'image/jpeg',
            0.9
        )
    })
}
