import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Check if the subdomain is smart.link
  if (hostname.startsWith('smart.link')) {
    return NextResponse.redirect('https://www.google.com');
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
