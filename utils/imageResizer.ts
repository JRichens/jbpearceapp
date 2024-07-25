function resizeImage(file: File, scaleFactor: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!

            // Calculate the size of the square
            const size = Math.min(img.width, img.height)

            // Calculate the scaled size
            const scaledSize = Math.floor(size * scaleFactor)

            // Set canvas dimensions to the scaled size
            canvas.width = scaledSize
            canvas.height = scaledSize

            // Calculate offsets to center the image
            const offsetX = (img.width - size) / 2
            const offsetY = (img.height - size) / 2

            // Draw the image on the canvas
            ctx.drawImage(
                img,
                offsetX,
                offsetY,
                size,
                size, // Source rectangle
                0,
                0,
                scaledSize,
                scaledSize // Destination rectangle
            )

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob !== null) {
                    resolve(blob)
                } else {
                    reject(new Error('Failed to generate blob from canvas'))
                }
            }, file.type)
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }
    })
}

export default resizeImage
