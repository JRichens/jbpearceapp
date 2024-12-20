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
                1.0 // Maximum quality for high resolution images
            )
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        img.src = URL.createObjectURL(file)
    })
}

// Check if the browser supports getUserMedia with better browser compatibility
const hasGetUserMedia = () => {
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
        console.error(
            'Not in secure context - camera access requires HTTPS or localhost'
        )
        return false
    }

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
        console.log('Starting camera initialization...')

        // Check if we're in a secure context
        if (!window.isSecureContext) {
            throw new Error(
                'Camera access requires a secure connection (HTTPS) or localhost.'
            )
        }

        // Check if browser supports getUserMedia
        if (!hasGetUserMedia()) {
            console.error('getUserMedia is not supported')
            throw new Error(
                'Camera access is not supported in this browser. Please ensure you are using a modern browser with HTTPS.'
            )
        }

        // Check if video element exists
        if (!videoRef.current) {
            console.error('Video element not found')
            throw new Error('Video element initialization failed.')
        }

        // Ensure we have mediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Camera API is not available in this browser. Please check your browser settings and permissions.'
            )
        }

        console.log('Attempting to access camera...')

        // First try with environment-facing camera (rear camera on mobile)
        try {
            console.log('Trying environment-facing camera...')
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
            console.log('Camera constraints:', constraints)

            const stream = await navigator.mediaDevices.getUserMedia(
                constraints
            )
            console.log('Environment camera stream obtained')

            videoRef.current.srcObject = stream
            await waitForVideoElement(videoRef.current)
            console.log('Video element initialized with environment camera')
            return stream
        } catch (envError) {
            console.log(
                'Environment camera failed, trying fallback...',
                envError
            )

            // Fallback to any available camera with high quality
            console.log('Attempting fallback to any available camera...')
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
            console.log('Video element initialized with fallback camera')
            return stream
        }
    } catch (error) {
        console.error('Detailed camera error:', error)

        if (error instanceof DOMException) {
            switch (error.name) {
                case 'NotAllowedError':
                    throw new Error(
                        'Camera access denied. Please grant permission to use the camera in your browser settings.'
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
                    console.error('DOMException:', error.name, error.message)
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
            console.log('Stopping track:', track.kind, track.label)
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
                        console.error('Error processing captured photo:', error)
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
