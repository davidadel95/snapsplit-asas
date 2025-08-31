import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const USERNAME = process.env.GALLERY_USERNAME || 'davidadel95';
const PASSWORD = process.env.GALLERY_PASSWORD || 'snapsplit_photos';
const SESSION_COOKIE_NAME = 'gallery_session';
const SESSION_TOKEN = 'authenticated_user_token';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === USERNAME && password === PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Set secure session cookie
      response.cookies.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  const isAuthenticated = sessionCookie?.value === SESSION_TOKEN;
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookie
  response.cookies.delete(SESSION_COOKIE_NAME);
  
  return response;
}