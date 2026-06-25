import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * RBAC rules:
 *   /inspector/* → only INSPECTOR and ADMIN roles
 *   /admin/*     → only ADMIN and MANAGER roles
 *
 * Unauthorized users are redirected to /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check auth for protected routes
  const isInspectorRoute = pathname.startsWith("/inspector") && pathname !== "/inspector-login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isInspectorRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Get session using Auth.js
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Inspector routes: only INSPECTOR, except inspect detail page which allows SELLER/ADMIN/MANAGER
  if (isInspectorRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/inspector-login", request.url));
    }
    const isInspectPage = pathname.startsWith("/inspector/inspect/");
    const allowedRoles = isInspectPage ? ["INSPECTOR", "SELLER", "ADMIN", "MANAGER"] : ["INSPECTOR"];
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(
        new URL(`/unauthorized?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  // Admin routes: only ADMIN and MANAGER
  if (isAdminRoute) {
    if (!role || !["ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public uploads
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads).*)",
  ],
};
