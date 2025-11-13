import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that require authentication
const ADMIN_ROUTES = ["/admin", "/api/admin"];

// TODO: Replace with actual authentication check when auth is implemented
// For now, this is a placeholder that allows all access
function isAuthenticated(request: NextRequest): boolean {
  // Check for session cookie or auth header
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("session");
  
  // For development, allow access if either exists
  // In production, verify the token/session
  return !!(authHeader || sessionCookie);
}

// TODO: Replace with actual role check when auth is implemented
// For now, this is a placeholder that allows all authenticated users
function isAdmin(request: NextRequest): boolean {
  // In production, check user role from session/token
  // For now, return true if authenticated
  return isAuthenticated(request);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires admin access
  const requiresAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (requiresAdmin) {
    // TODO: Implement proper authentication check
    // For now, allow all access in development
    
    // Uncomment when auth is ready:
    // if (!isAuthenticated(request)) {
    //   return NextResponse.redirect(new URL("/auth/login", request.url));
    // }
    
    // if (!isAdmin(request)) {
    //   return NextResponse.redirect(new URL("/unauthorized", request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
