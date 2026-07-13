import { randomBytes } from "crypto";

/** Canonical public site URL for patient-facing share links */
export const APP_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://hormoncare.mediiqr.com"
).replace(/\/$/, "");

export function generateAssessmentAccessToken() {
  return randomBytes(24).toString("base64url");
}

/**
 * Absolute share URL for assessment / followup forms.
 * Always uses NEXT_PUBLIC_APP_URL (or hormoncare.mediiqr.com) so WhatsApp/SMS
 * links work even when the admin panel is opened from another host.
 */
export function getShareBaseUrl(_origin?: string) {
  return APP_PUBLIC_URL;
}

export function buildAssessmentFormUrl(token: string, origin?: string) {
  return `${getShareBaseUrl(origin)}/assessment/${token}`;
}

export function buildFollowupFormUrl(token: string, origin?: string) {
  return `${getShareBaseUrl(origin)}/followup/${token}`;
}
