import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Match /@username (but not /@something/anything-else)
  const match = pathname.match(/^\/@([\w.-]+)$/);
  if (match) {
    // Rewrite /@mnty to /mnty
    const username = match[1];
    return NextResponse.rewrite(new URL(`/${username}`, request.url));
  }
  return NextResponse.next();
}
