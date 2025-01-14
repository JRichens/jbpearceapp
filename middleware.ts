import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'

export default authMiddleware({
    publicRoutes: [
        '/api/dailychecks',
        '/api/uploadthing',
        '/api/uploadthing/(.*)', // Allow all uploadthing routes
        '/api/revoke-sessions',
        '/sign-in',
        '/sign-up',
    ],
    afterAuth(auth, req) {
        // Handle UploadThing routes
        if (req.url.includes('/api/uploadthing')) {
            return
        }

        // Check if the current route is already the sign-in page to prevent redirect loops
        if (req.url.includes('/sign-in')) {
            return
        }

        // Redirect to sign-in if not authenticated
        if (!auth.userId) {
            // Get the full URL without query parameters
            const url = new URL(req.url)
            const returnUrl = `${url.protocol}//${url.host}${url.pathname}`
            return redirectToSignIn({ returnBackUrl: returnUrl })
        }

        // If authenticated but still on sign-in/up pages, redirect to home
        if (
            auth.userId &&
            (req.url.includes('/sign-in') || req.url.includes('/sign-up'))
        ) {
            return Response.redirect(new URL('/', req.url))
        }
    },
    apiRoutes: [],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
