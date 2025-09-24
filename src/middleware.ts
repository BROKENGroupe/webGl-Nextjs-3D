import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Permitir archivos estáticos y públicos
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

    // Si está logueado e intenta entrar al login → redirigir al dashboard
    if (token && pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Si entra a raíz (/) → decidir según sesión
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(token ? "/home" : "/auth/login", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!auth/register|api|_next/static|_next/image|favicon.ico|assets|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$).*)",
  ],
};
