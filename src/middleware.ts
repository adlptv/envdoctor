import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

export function middleware(req: NextRequest) {
  // Skip rate limiting for static assets
  if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Try again later.' },
          { status: 429 },
        );
      }
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
