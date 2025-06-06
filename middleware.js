import { NextResponse } from 'next/server';
import { auth } from './lib/firebaseAdmin';
 
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const protectedRoutes = ['/notes', '/settings'];
  const isProtectedRoute = protectedRoutes.includes(pathname);
 
  // Get Firebase auth token from cookies
  const token = req.cookies.get('__session')?.value;
 
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
 
  // Verify token with Firebase Admin SDK
  if (isProtectedRoute && token) {
    try {
      await auth.verifyIdToken(token);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/notes', '/settings'],
};