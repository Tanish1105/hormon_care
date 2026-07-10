import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hormon-secret"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  let user: { role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as { role: string };
    } catch {
      user = null;
    }
  }

  if (pathname.startsWith("/assessment/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/followup/")) {
    return NextResponse.next();
  }

  if (pathname === "/patient/login") {
    return NextResponse.redirect(new URL("/", request.url));
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
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/patient/:path*", "/assessment/:path*", "/followup/:path*"],
};
