import { authMiddleware, redirectToSignIn } from "@clerk/nextjs"

export default authMiddleware({
  debug: true,
  afterAuth: redirectToSignIn({
    returnBackUrl: "/sign-in",
  }),
  publicRoutes: [
    "/api/dailychecks",
    "/api/uploadthing",
    "/sign-in",
    "/sign-up",
  ],
  apiRoutes: [],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
