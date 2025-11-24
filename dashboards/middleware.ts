import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: Middleware runs on the server and cannot access localStorage
  // Client-side protection is handled by ProtectedRoute component
  // This middleware can be extended to check cookies if tokens are stored there
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/corporate/:path*', '/branch/:path*'],
};

