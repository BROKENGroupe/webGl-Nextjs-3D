// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log('[MIDDLEWARE] Request:', {
      pathname,
      hasToken: !!token,
      registrationComplete: token?.registrationComplete
    });

    // ✅ Si no hay token, NextAuth manejará login
    if (!token) {
      return NextResponse.next();
    }

    const registrationComplete = token.registrationComplete;
    const workspaceSlug = token.slug;

    // ✅ REGLA: Si registrationComplete !== true, SOLO onboarding
    if (registrationComplete !== true) {
      if (pathname.startsWith('/register-onboarding') ||
          pathname.startsWith('/auth/') ||
          pathname.startsWith('/api/')) {
        console.log('[MIDDLEWARE] -> Allowing access to:', pathname);
        return NextResponse.next();
      }

      // ✅ Redirección simple sin parámetros
      console.log(`[MIDDLEWARE] -> Forcing onboarding from ${pathname}`);
      return NextResponse.redirect(new URL('/register-onboarding', req.url));
    }

    // ✅ registrationComplete === true
    console.log('[MIDDLEWARE] -> Registration complete, full access');

    // ✅ Evitar onboarding si ya completó registro
    if (pathname.startsWith('/register-onboarding')) {
      const redirectUrl = workspaceSlug 
        ? new URL(`/${workspaceSlug}/home`, req.url)
        : new URL('/home', req.url);
      console.log('[MIDDLEWARE] -> Redirecting from onboarding to app');
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ Redirección desde root
    if (pathname === '/') {
      const redirectUrl = workspaceSlug 
        ? new URL(`/${workspaceSlug}/home`, req.url)
        : new URL('/home', req.url);
      console.log('[MIDDLEWARE] -> Root redirect');
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // ✅ Rutas públicas
        const publicRoutes = [
          '/auth/',
          '/api/auth/',
          '/_next/',
          '/favicon.ico'
        ];
        
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // ✅ Requerir token para rutas protegidas
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
