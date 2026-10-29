import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/utils/session-cookie";

/*
 * Route guard (Next 16 "proxy", formerly middleware). Signed-out visitors are sent
 * from /account to /login and back afterwards; signed-in ones skip the auth pages.
 * The cookie is only a hint — the account page still checks the real session.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.has(SESSION_COOKIE);

  if (pathname.startsWith("/account") && !signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && signedIn) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/signup"],
};
