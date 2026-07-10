import { NextResponse } from "next/server";
import { testMysqlConnection } from "@/lib/mysql-adapter";

export async function GET() {
  try {
    const result = await testMysqlConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
