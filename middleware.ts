import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const role = token?.role as string | undefined

    if (!token) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Role-based Access Control definitions
    const allRoles = ["BUYER", "SELLER", "INSPECTOR", "ADMIN", "MANAGER"]
    const routeAccess = [
      { prefix: "/api/admin", roles: ["ADMIN", "MANAGER"] },
      { prefix: "/admin", roles: ["ADMIN", "MANAGER"] },
      { prefix: "/api/inspector", roles: ["INSPECTOR", "ADMIN", "MANAGER"] },
      { prefix: "/inspector", roles: ["INSPECTOR", "ADMIN", "MANAGER"] },
      { prefix: "/api/user", roles: allRoles },
      { prefix: "/api/buyer", roles: allRoles },
      { prefix: "/api/seller", roles: allRoles },
      { prefix: "/api/messages", roles: allRoles },
      { prefix: "/api/notifications", roles: allRoles },
      { prefix: "/api/upload", roles: allRoles },
      { prefix: "/user", roles: allRoles },
    ]

    for (const route of routeAccess) {
      if (path.startsWith(route.prefix)) {
        if (!role || !route.roles.includes(role)) {
          if (path.startsWith("/api/")) {
            return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 })
          } else {
            return NextResponse.redirect(new URL("/403", req.url))
          }
        }
      }
    }

    return NextResponse.next()
  },
  { 
    callbacks: { 
      authorized: () => true 
    } 
  }
)

export const config = {
  matcher: [
    "/api/admin/:path*", 
    "/api/inspector/:path*", 
    "/api/user/:path*", 
    "/api/buyer/:path*",
    "/api/seller/:path*",
    "/api/messages/:path*",
    "/api/notifications/:path*",
    "/api/upload/:path*",
    "/admin/:path*", 
    "/inspector/:path*", 
    "/user/:path*"
  ],
}
