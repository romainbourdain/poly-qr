import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionCookie } from "@/server/services/session";

export const config = {
  matcher: ["/admin/:path*", "/scanner/:path*"],
};

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!(await verifySessionCookie(cookie))) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
