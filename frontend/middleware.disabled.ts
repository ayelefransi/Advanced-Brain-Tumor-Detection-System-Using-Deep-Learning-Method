import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/",
    "/upload",
    "/patients/:path*",
    "/analytics",
    "/settings",
    "/results/:path*"
  ]
} 