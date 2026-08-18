import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hormon-secret"
);

const STAFF_ROLES = new Set(["ADMIN", "DOCTOR", "DOCTOR_STAFF", "DIETITIAN"]);

function panelForRole(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "DOCTOR") return "/doctor";
  if (role === "DOCTOR_STAFF") return "/staff";
  if (role === "DIETITIAN") return "/dietitian";
  return "/admin";
}

function panelFromPath(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "ADMIN";
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) return "DOCTOR";
  if (pathname === "/staff" || pathname.startsWith("/staff/")) return "STAFF";
  if (pathname === "/dietitian" || pathname.startsWith("/dietitian/")) return "DIETITIAN";
  return null;
}

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

  const panel = panelFromPath(pathname);
  if (panel) {
    const isAdminLoginPage = pathname === "/admin";
    if (isAdminLoginPage && (!user || !STAFF_ROLES.has(user.role))) {
      return next();
    }

    if (!user || !STAFF_ROLES.has(user.role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const expected = panelForRole(user.role);
    const currentRoot =
      panel === "ADMIN"
        ? "/admin"
        : panel === "DOCTOR"
          ? "/doctor"
          : panel === "STAFF"
            ? "/staff"
            : "/dietitian";

    // Admin can open every panel. Other roles stay on their own panel.
    if (user.role !== "ADMIN" && expected !== currentRoot) {
      const suffix = pathname.slice(currentRoot.length);
      return NextResponse.redirect(new URL(`${expected}${suffix}`, request.url));
    }

    if (pathname.startsWith("/admin/") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL(expected, request.url));
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
    "/admin",
    "/doctor/:path*",
    "/doctor",
    "/staff/:path*",
    "/staff",
    "/dietitian/:path*",
    "/dietitian",
    "/patient/:path*",
    "/assessment/:path*",
    "/followup/:path*",
    "/api/:path*",
  ],
};
