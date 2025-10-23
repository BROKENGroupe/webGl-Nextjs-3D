import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {

    const status = req.nextauth.token?.registrationComplete;

    console.log("Middleware check - registrationComplete status:", status);

    if (!status) {
      return Response.redirect(new URL('/onboarding', req.url));
    }
  }
  
)

export const config = { matcher: ['/home'] }