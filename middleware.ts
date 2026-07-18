import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("rm_session");

  // Fast path: no session cookie at all, skip the network round trip.
  if (!sessionCookie) {
    return redirectToLogin(request);
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (res.status === 401) {
      return redirectToLogin(request);
    }
  } catch {
    // If the backend is unreachable, let the request through — the page-level
    // useMe() check and API calls will surface the failure instead of hard-blocking.
    return NextResponse.next();
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
