import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hormon-secret"
);

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export type SessionUser = {
  id: string;
  username: string;
  role: "ADMIN" | "PATIENT";
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

function tokenFromAuthorization(value: string | null): string | null {
  if (!value) return null;
  return value.toLowerCase().startsWith("bearer ")
    ? value.slice(7).trim()
    : null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const candidates = [
    cookieStore.get("session")?.value,
    tokenFromAuthorization(headerStore.get("authorization")),
    headerStore.get("x-session-token"),
  ];

  for (const raw of candidates) {
    const token = raw?.trim();
    if (!token) continue;
    const user = await verifyToken(token);
    if (user) return user;
  }

  return null;
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("session", token, SESSION_COOKIE_OPTIONS);
  return response;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, SESSION_COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export function generatePatientCredentials() {
  const num = Math.floor(100000 + Math.random() * 900000);
  const username = `PAT${num}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { username, password };
}
