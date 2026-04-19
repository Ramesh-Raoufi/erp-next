import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /app/* routes - client-side auth handles actual redirect
  // The ProtectedRoute component handles client-side protection
  // Middleware just passes through; JWT is in localStorage (not cookies), 
  // so server-side middleware cannot check it
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
