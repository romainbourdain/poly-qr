import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SUBJECT,
  SCANNER_SESSION_COOKIE,
  scannerSubject,
  verifySessionCookie,
} from "@/server/services/session";

export const config = {
  matcher: ["/admin/:path*", "/scanner/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/scanner/")) {
    // /scanner/<evenementId>[/login|/resultat] : une session de scanner ne vaut que pour son événement.
    const [, , evenementId, page] = pathname.split("/");
    if (!evenementId || page === "login") return NextResponse.next();

    const cookie = request.cookies.get(SCANNER_SESSION_COOKIE)?.value;
    if (!(await verifySessionCookie(cookie, scannerSubject(evenementId)))) {
      return NextResponse.redirect(
        new URL(`/scanner/${evenementId}/login`, request.url),
      );
    }
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifySessionCookie(cookie, ADMIN_SUBJECT))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
