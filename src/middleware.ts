import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
// Permitir archivos estáticos y públicos PRIMERO
   

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
