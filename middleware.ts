// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add any paths you want to protect
const PROTECTED_ROUTES = ['/cart', '/profile'];

// Skip static/public assets
const PUBLIC_FILE = /\.(.*)$/;
const EXCLUDE_PREFIXES = ['/_next', '/api', '/assets', '/public'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow static & excluded prefixes
  if (PUBLIC_FILE.test(pathname) || EXCLUDE_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 🔐 Edge can ONLY read cookies (not localStorage), so cookie is the source of truth
  const sessionId = req.cookies.get('sessionId')?.value || '';

  const isProtected = PROTECTED_ROUTES.some(
    base => pathname === base || pathname.startsWith(`${base}/`)
  );

  // Block unauthenticated access to protected routes
  if (isProtected && !sessionId) {
    const redirectTo = pathname + (search || '');
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(redirectTo)}`;
    return NextResponse.redirect(url);
  }

  // If logged in, keep users out of auth pages
  if (sessionId && (pathname === '/login' || pathname === '/register')) {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // match everything except known public assets
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|assets|public).*)',
  ],
};
