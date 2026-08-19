import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readMediaFile } from "@/lib/serve-media";

export const runtime = "nodejs";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { filename } = await params;
  const file = await readMediaFile(filename);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(file.body, {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
