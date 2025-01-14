// Function to convert image to JPEG format
// Calculate optimal dimensions while maintaining aspect ratio
const calculateOptimalDimensions = (
    width: number,
    height: number,
    maxDimension: number = 2048
) => {
    if (width <= maxDimension && height <= maxDimension) {
        return { width, height }
    }

    const aspectRatio = width / height
    if (width > height) {
        return {
            width: maxDimension,
            height: Math.round(maxDimension / aspectRatio),
        }
    }
    return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension,
    }
}

export async function convertToJPEG(file: File | Blob): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: false,
        })

        img.onload = () => {
            // Calculate optimal dimensions for the image
            const { width, height } = calculateOptimalDimensions(
                img.width,
                img.height
            )

            canvas.width = width
            canvas.height = height

            // Enable high-quality image rendering
            if (ctx) {
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                // Use better quality settings
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, 0, 0, width, height)
            }

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const convertedFile = new File([blob], 'vehicle.jpg', {
                            type: 'image/jpeg',
                        })
                        resolve(convertedFile)
                    } else {
                        reject(new Error('Failed to convert image'))
                    }
                },
                'image/jpeg',
                1.0 // Maximum quality
            )
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
    })
}

// Check if the browser supports getUserMedia with better browser compatibility
const hasGetUserMedia = () => {
    // Check for various implementations of getUserMedia
    const mediaDevices = navigator.mediaDevices || {}

    if (!mediaDevices.getUserMedia) {
        // Try to handle older implementations
        // @ts-ignore - intentionally checking for older implementations
        mediaDevices.getUserMedia =
            // @ts-ignore
            navigator.getUserMedia ||
            // @ts-ignore
            navigator.webkitGetUserMedia ||
            // @ts-ignore
            navigator.mozGetUserMedia ||
            // @ts-ignore
            navigator.msGetUserMedia
    }

    return !!mediaDevices.getUserMedia
}

// Wait for video element to be ready
const waitForVideoElement = (videoElement: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve) => {
        if (videoElement.readyState >= 2) {
            resolve()
        } else {
            videoElement.addEventListener('loadeddata', () => resolve(), {
                once: true,
            })
        }
    })
}

export async function startCamera(
    videoRef: React.RefObject<HTMLVideoElement>
): Promise<MediaStream | null> {
    try {
        // Check if browser supports getUserMedia
        if (!hasGetUserMedia()) {
            throw new Error(
                'Camera access is not supported in this browser. Please ensure you are using a modern browser with HTTPS.'
            )
        }

        // Check if video element exists
        if (!videoRef.current) {
            throw new Error('Video element initialization failed.')
        }

        // Ensure we have mediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Camera API is not available in this browser. Please check your browser settings and permissions.'
            )
        }

        // First try with environment-facing camera (rear camera on mobile)
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 4096 }, // 4K resolution for high quality
                    height: { ideal: 2160 },
                    aspectRatio: { ideal: 4 / 3 },
                    frameRate: { ideal: 30 },
                    resizeMode: 'none',
                },
            }

            const stream = await navigator.mediaDevices.getUserMedia(
                constraints
            )

            videoRef.current.srcObject = stream
            await waitForVideoElement(videoRef.current)
            return stream
        } catch (envError) {
            // Fallback to any available camera with high quality
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 4096 },
                    height: { ideal: 2160 },
                    frameRate: { ideal: 30 },
                },
            })

            if (!videoRef.current) {
                throw new Error('Video element lost during fallback.')
            }

            videoRef.current.srcObject = stream
            await waitForVideoElement(videoRef.current)
            return stream
        }
    } catch (error) {
        if (error instanceof DOMException) {
            switch (error.name) {
                case 'NotAllowedError':
                    throw new Error(
                        'Camera access denied. Please ensure you are using HTTPS or localhost, and grant permission to use the camera in your browser settings.'
                    )
                case 'NotFoundError':
                    throw new Error('No camera found on this device.')
                case 'NotReadableError':
                    throw new Error(
                        'Camera is already in use by another application.'
                    )
                case 'OverconstrainedError':
                    throw new Error(
                        'Could not find a camera matching the requirements.'
                    )
                default:
                    throw new Error(`Camera error: ${error.message}`)
            }
        }

        if (error instanceof Error) {
            throw error // Throw the original error if it's already formatted
        }

        throw new Error(
            'Failed to access camera. Please ensure your device has a working camera and try again.'
        )
    }
}

export function stopCamera(stream: MediaStream | null) {
    if (stream) {
        stream.getTracks().forEach((track) => {
            track.stop()
        })
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

    // Set canvas to maximum size from video
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
    })
    if (!ctx) return null

    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)

    return new Promise((resolve) => {
        canvas.toBlob(
            async (blob) => {
                if (blob) {
                    try {
                        const jpegFile = await convertToJPEG(blob)
                        resolve(jpegFile)
                    } catch (error) {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            },
            'image/jpeg',
            1.0 // Maximum quality for high resolution images
        )
    })
}
