/** Rewrite legacy `/uploads/file` paths to the durable media API. */
export function resolvePublicMediaUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const uploadMatch = path.match(/^\/uploads\/([^/?#]+)$/i);
  if (uploadMatch) return `/api/media/${uploadMatch[1]}`;
  return path;
}
