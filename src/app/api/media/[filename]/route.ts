import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { mediaContentType } from "@/lib/upload";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

type Params = { params: Promise<{ filename: string }> };

/**
 * Serve media from MySQL (primary) with legacy disk fallback.
 * Hostinger redeploys wipe public/uploads, so DB storage is durable.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params;
  const safe = path.basename(filename || "");
  if (!safe || safe.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const row = await prisma.mediaFile.findUnique({
      where: { filename: safe },
      select: { data: true, mimeType: true },
    });
    if (row) {
      return new NextResponse(Buffer.from(row.data), {
        status: 200,
        headers: {
          "Content-Type": mediaContentType(safe, row.mimeType),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("media db read error:", error);
  }

  // Legacy files that still exist on disk
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": mediaContentType(safe),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
