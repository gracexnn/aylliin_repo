import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

function isPublicApiRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicReadOnlyApi =
    request.method === 'GET' &&
    (pathname === '/api/posts' || pathname === '/api/departure-sessions');

  if (pathname.startsWith('/api/public/')) {
    return true;
  }

  if (pathname === '/api/payments/callback') {
    return true;
  }

  // Cleanup endpoint uses its own Bearer token auth (for cron job access)
  if (
    request.method === 'POST' &&
    pathname === '/api/admin/stale-bookings/cleanup'
  ) {
    return true;
  }

  if (request.method === 'GET' && pathname.startsWith('/api/travel/')) {
    return true;
  }

  if (isPublicReadOnlyApi) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  const isAuthenticated = Boolean(token);

  if (pathname === '/') {
    const target = isAuthenticated ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (isPublicApiRequest(request)) {
    return NextResponse.next();
  }

  const isProtectedPage = pathname.startsWith('/dashboard');
  const isProtectedApi = pathname.startsWith('/api');

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: 'Нэвтрэх эрхгүй байна' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirectTo', `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/api/:path*'],
};
