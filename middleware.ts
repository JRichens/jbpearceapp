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
    apiRoutes: [],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
