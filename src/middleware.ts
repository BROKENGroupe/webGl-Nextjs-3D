import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Permitir archivos estáticos y públicos PRIMERO
    if (
      pathname.startsWith("/_next") ||         // Next.js internals
      pathname.startsWith("/favicon.ico") ||   // favicon
      pathname.startsWith("/assets") ||        // tu carpeta /public/assets/*
      pathname.endsWith(".svg") ||             // SVGs en public root
      pathname.endsWith(".png") ||             // PNGs directos en public
      pathname.endsWith(".jpg") ||             // JPGs si usas alguno
      pathname.endsWith(".jpeg") ||            // JPEGs
      pathname.endsWith(".webp")               // WebP
    ) {
      return NextResponse.next();
    }

    // ✅ RUTAS COMPLETAMENTE PÚBLICAS - No requieren ninguna validación
    const publicRoutes = [
      "/auth/register",
      "/register-onboarding", 
      "/auth/login",
      "/auth/signup",
      "/auth/forgot-password",
    ];

    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // API routes públicas
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/accounts/register") ||
      pathname.startsWith("/api/accounts/create")
    ) {
      return NextResponse.next();
    }

    // Si entra a raíz (/) → decidir según sesión
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(token ? "/home" : "/auth/login", req.url)
      );
    }

    // Si está logueado e intenta entrar al login → redirigir al dashboard
    if (token && pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // ✅ SOLO AHORA - Si no tiene token para rutas protegidas → redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

// ✅ Matcher más simple - excluye APIs completamente
export const config = {
  matcher: [
  ],
};
