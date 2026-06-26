import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Check if the subdomain is smart.link
  if (hostname.startsWith('smart.link')) {
    return NextResponse.redirect('https://www.google.com');
  }

  // Protect the admin feedback dashboard
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('gallery_session');
    if (sessionCookie?.value !== 'authenticated_user_token') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
