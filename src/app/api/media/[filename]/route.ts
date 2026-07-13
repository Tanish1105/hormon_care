import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mpeg: "video/mpeg",
};

type Params = { params: Promise<{ filename: string }> };

/**
 * Serves uploaded media for environments where static `/uploads` files
 * are not reliably exposed (e.g. some Node host build layouts).
 * Falls through style: `/api/media/<file>` → public/uploads/<file>
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params;
  const safe = path.basename(filename || "");
  if (!safe || safe.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, safe);
  try {
    const data = await fs.readFile(filePath);
    const ext = safe.split(".").pop()?.toLowerCase() || "";
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
