import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'

export default authMiddleware({
    publicRoutes: [
        '/api/dailychecks',
        '/api/uploadthing',
        '/api/uploadthing/(.*)', // Allow all uploadthing routes
        '/api/revoke-sessions',
        '/sign-in',
        '/sign-up',
        '/api/healthcheck', // Allow healthcheck endpoint for CLI script
        '/api/ebay-listings/check-sold', // Allow sold items checker endpoint for CLI script
    ],
    apiRoutes: [],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
