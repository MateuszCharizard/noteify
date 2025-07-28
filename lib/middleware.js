import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const protectedRoutes = ['/notes', '/settings'];
  const isProtectedRoute = protectedRoutes.includes(pathname);

  // Supabase session cookie name: supabase-auth-token (or check your config)
  const token = req.cookies.get('sb-access-token')?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Optionally, verify token with Supabase JWT if needed

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes', '/settings'],
};