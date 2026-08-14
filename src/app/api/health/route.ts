import { NextResponse } from "next/server";

/** Lightweight liveness check for Hostinger / reverse proxies (no DB). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "jeevanm",
    time: new Date().toISOString(),
  });
}
