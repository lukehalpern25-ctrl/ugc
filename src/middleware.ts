import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle recovery param — pass through to dashboard
  if (pathname === "/gymdex/dashboard" && searchParams.has("recover")) {
    // Let the page handle recovery param (stored in localStorage client-side)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gymdex/:path*"],
};
