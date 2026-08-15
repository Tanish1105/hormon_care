import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hormon-secret"
);

function sessionTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get("session")?.value?.trim();
  if (cookieToken) return cookieToken;

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const bearer = auth.slice(7).trim();
    if (bearer) return bearer;
  }

  const headerToken = request.headers.get("x-session-token")?.trim();
  return headerToken || null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = sessionTokenFromRequest(request);
  const requestHeaders = new Headers(request.headers);
  if (token && !request.cookies.get("session")?.value) {
    const existing = request.headers.get("cookie") ?? "";
    requestHeaders.set(
      "cookie",
      existing ? `${existing}; session=${token}` : `session=${token}`,
    );
  }

  let user: { role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as { role: string };
    } catch {
      user = null;
    }
  }

  const next = () =>
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  if (pathname.startsWith("/assessment/")) {
    return next();
  }

  if (pathname.startsWith("/followup/")) {
    return next();
  }

  if (pathname === "/patient/login") {
    if (user?.role === "PATIENT") {
      return NextResponse.redirect(new URL("/patient", request.url));
    }
    return next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin/") && pathname !== "/admin/login") {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (pathname.startsWith("/patient") && pathname !== "/patient/login") {
    if (!user || user.role !== "PATIENT") {
      return NextResponse.redirect(new URL("/patient/login", request.url));
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/patient/:path*",
    "/assessment/:path*",
    "/followup/:path*",
    "/api/:path*",
  ],
};
