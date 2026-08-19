import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { mediaContentType } from "@/lib/upload";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

export async function readMediaFile(filename: string) {
  const safe = path.basename(filename || "");
  if (!safe || safe.includes("..")) {
    return null;
  }

  try {
    const row = await prisma.mediaFile.findUnique({
      where: { filename: safe },
      select: { data: true, mimeType: true },
    });
    if (row?.data) {
      return {
        body: Buffer.from(row.data),
        contentType: mediaContentType(safe, row.mimeType),
      };
    }
  } catch (error) {
    console.error("media db read error:", safe, error);
  }

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return {
      body: data,
      contentType: mediaContentType(safe),
    };
  } catch {
    return null;
  }
}
