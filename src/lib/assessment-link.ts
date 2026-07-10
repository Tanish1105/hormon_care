import { randomBytes } from "crypto";

export function generateAssessmentAccessToken() {
  return randomBytes(24).toString("base64url");
}

export function buildAssessmentFormUrl(token: string, origin?: string) {
  const base = (origin || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (!base) return `/assessment/${token}`;
  return `${base}/assessment/${token}`;
}

export function buildFollowupFormUrl(token: string, origin?: string) {
  const base = (origin || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (!base) return `/followup/${token}`;
  return `${base}/followup/${token}`;
}
