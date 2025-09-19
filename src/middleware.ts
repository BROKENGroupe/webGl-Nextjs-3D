import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Excluir imágenes, fuentes, favicons, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets/images") || //
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

    // Si está logueado y entra al login → mandarlo al dashboard
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
    "/((?!auth/register|api|_next/static|_next/image|favicon.ico).*)",
  ],
}
