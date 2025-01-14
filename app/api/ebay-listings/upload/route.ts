import { createRouteHandler } from 'uploadthing/next'
import { uploadRouter } from '../../uploadthing/core'

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
    router: uploadRouter,
})
