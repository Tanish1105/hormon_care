import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 40 * 1024 * 1024;

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime", "video/mpeg"];

const EXT_MIME: Record<string, string> = {
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

export async function saveUpload(file: File, type: "image" | "video") {
  const allowed = type === "image" ? ALLOWED_IMAGE : ALLOWED_VIDEO;
  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowed.includes(file.type)) {
    throw new Error(`Invalid ${type} file type`);
  }
  if (file.size > maxSize) {
    throw new Error(
      `File too large (max ${type === "image" ? "10MB" : "40MB"})`
    );
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    (type === "image" ? "jpg" : "mp4");
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || EXT_MIME[ext] || "application/octet-stream";

  await prisma.mediaFile.create({
    data: {
      filename,
      mimeType,
      size: buffer.length,
      data: buffer,
    },
  });

  return `/api/media/${filename}`;
}

export function mediaContentType(filename: string, mimeType?: string | null) {
  if (mimeType) return mimeType;
  const ext = path.extname(filename).slice(1).toLowerCase();
  return EXT_MIME[ext] || "application/octet-stream";
}
