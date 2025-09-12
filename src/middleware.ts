import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value;

  const { pathname } = request.nextUrl;

  const publicRoutes = ["/auth/login", "/auth/register"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isPublicRoute && !authToken) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && isPublicRoute) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // if (authToken && request.nextUrl.pathname === "/auth/login") {
  //   const homeUrl = new URL("/", request.url);
  //   return NextResponse.redirect(homeUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
