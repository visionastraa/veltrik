import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // API route protection
    if (path.startsWith("/api/admin") && !["ADMIN", "MANAGER"].includes(token?.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (path.startsWith("/api/inspector") && token?.role !== "INSPECTOR" && !["ADMIN", "MANAGER"].includes(token?.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Frontend admin route protection
    if (path.startsWith("/admin") && !["ADMIN", "MANAGER"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/user", req.url))
    }

    // Frontend inspector route protection
    if (path.startsWith("/inspector") && token?.role !== "INSPECTOR" && !["ADMIN", "MANAGER"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/user", req.url))
    }

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ["/api/admin/:path*", "/api/inspector/:path*", "/admin/:path*", "/inspector/:path*"],
}
