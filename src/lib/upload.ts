import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime", "video/mpeg"];

export async function saveUpload(file: File, type: "image" | "video") {
  const allowed = type === "image" ? ALLOWED_IMAGE : ALLOWED_VIDEO;
  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowed.includes(file.type)) {
    throw new Error(`Invalid ${type} file type`);
  }
  if (file.size > maxSize) {
    throw new Error(`File too large (max ${type === "image" ? "10MB" : "100MB"})`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.split(".").pop()?.toLowerCase() || (type === "image" ? "jpg" : "mp4");
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  // Prefer API media URL so mobile / some hosts can load files reliably
  return `/api/media/${filename}`;
}
