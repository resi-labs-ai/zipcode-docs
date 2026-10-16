import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Compare exact case to avoid a case-insensitive redirect loop.
  const { pathname } = request.nextUrl
  if (pathname === '/machines' || pathname.startsWith('/machines/')) {
    const destination = request.nextUrl.clone()
    destination.pathname = `/Machines${pathname.slice('/machines'.length)}`
    return NextResponse.redirect(destination, 307)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/machines', '/machines/:path*', '/Machines', '/Machines/:path*'] }
