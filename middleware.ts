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
            return redirectToSignIn({ returnBackUrl: `${req.url}` })
        }
    },
    apiRoutes: [],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
