import { NextResponse } from "next/server";
import { testMysqlConnection } from "@/lib/mysql-adapter";

export async function GET() {
  try {
    const result = await testMysqlConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    const clientHost = message.match(/@'([^']+)'/)?.[1] ?? null;
    return NextResponse.json(
      {
        ok: false,
        error: message,
        clientHost,
        hint: clientHost
          ? `Add ${clientHost} (or %) in hPanel → Databases → Remote MySQL`
          : "Add your public IP (or %) in hPanel → Databases → Remote MySQL",
      },
      { status: 503 }
    );
  }
}
