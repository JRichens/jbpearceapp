import { IdData } from './types'

export const processImage = async (imageData: string) => {
    try {
        const response = await fetch(imageData)
        const blob = await response.blob()
        return new File([blob], 'customer-id.jpg', { type: 'image/jpeg' })
    } catch (error) {
        console.error('Error processing image:', error)
        throw new Error('Failed to process image')
    }
}

export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log('Starting image compression')
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (event) => {
            console.log('File read complete')
            const img = new window.Image()
            img.src = event.target?.result as string

            img.onload = () => {
                console.log('Image loaded:', {
                    originalWidth: img.width,
                    originalHeight: img.height,
                })

                const canvas = document.createElement('canvas')
                const width = img.width * 0.4
                const height = img.height * 0.4

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
                console.log('Compression complete')
                resolve(compressedBase64)
            }

            img.onerror = (err) => {
                console.error('Image load error:', err)
                reject(new Error('Failed to load image'))
            }
        }

        reader.onerror = (err) => {
            console.error('File read error:', err)
            reject(new Error('Failed to read file'))
        }
    })
}

export const createFormData = (
    image: File,
    additionalData?: Record<string, string>
) => {
    const formData = new FormData()
    formData.append('image', image, 'customer-id.jpg')
    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value)
        })
    }
    return formData
}

export const isFormValid = (formValues: IdData): boolean => {
    return (
        formValues.code.length > 0 &&
        formValues.fullName.length > 0 &&
        formValues.firstLineAddress.length > 0 &&
        formValues.postcode.length > 0 &&
        formValues.registration.length > 0 &&
        ((formValues.paymentType === 'BACS' &&
            formValues.telephone.length > 0 &&
            formValues.accountNo.length === 8 &&
            formValues.sortCode.length === 6) ||
            formValues.paymentType !== 'BACS')
    )
}
