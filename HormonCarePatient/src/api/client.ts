/**
 * HTTP client for the Hormon Care patient backend.
 *
 * The upstream Next.js backend at https://hormoncare.mediiqr.com issues an HttpOnly
 * session cookie on login. React Native's fetch does NOT automatically persist
 * cookies between app launches, so we manage the raw `Set-Cookie` header ourselves
 * and re-send it via the `Cookie` request header on every subsequent call.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://hormoncare.mediiqr.com';
const COOKIE_KEY = 'hc.sessionCookie';
const USER_KEY = 'hc.user';

let cachedCookie: string | null = null;

export async function loadSession(): Promise<string | null> {
  if (cachedCookie) return cachedCookie;
  cachedCookie = await AsyncStorage.getItem(COOKIE_KEY);
  return cachedCookie;
}

export async function saveSession(cookie: string): Promise<void> {
  cachedCookie = cookie;
  await AsyncStorage.setItem(COOKIE_KEY, cookie);
}

export async function clearSession(): Promise<void> {
  cachedCookie = null;
  await AsyncStorage.multiRemove([COOKIE_KEY, USER_KEY]);
}

export async function saveUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUser<T = any>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Extract the `session=...` value from a Set-Cookie header string.
 * Header format: "session=eyJ...; Path=/; Expires=...; HttpOnly; Secure"
 */
function extractSessionCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/session=([^;]+)/i);
  return match ? `session=${match[1]}` : null;
}

export type ApiError = { status: number; message: string };

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookie = await loadSession();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  };
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // capture any refreshed session cookie
  const setCookie =
    // @ts-ignore - RN exposes raw headers on some platforms
    (typeof res.headers.get === 'function' && res.headers.get('set-cookie')) ||
    null;
  const refreshed = extractSessionCookie(setCookie);
  if (refreshed) await saveSession(refreshed);

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: json?.error || json?.message || `Request failed (${res.status})`,
    };
    throw err;
  }
  return json as T;
}

// ---- Auth ----------------------------------------------------------------

export type PatientUser = {
  id: string;
  username: string;
  name: string;
  role: 'PATIENT' | string;
};

export async function login(
  username: string,
  password: string,
): Promise<PatientUser> {
  const res = await fetch(`${BASE_URL}/api/auth/patient/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const setCookie =
    // @ts-ignore
    (typeof res.headers.get === 'function' && res.headers.get('set-cookie')) ||
    null;
  const session = extractSessionCookie(setCookie);
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw { status: res.status, message: json?.error || 'Login failed' } as ApiError;
  }
  if (session) await saveSession(session);
  await saveUser(json.user);
  return json.user as PatientUser;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
  await clearSession();
}

// ---- Patient endpoints ---------------------------------------------------

export type PlanContent = {
  id: string;
  type: 'YOUTUBE' | 'TEXT' | 'IMAGE' | 'VIDEO' | string;
  title: string | null;
  description: string | null;
  url: string | null;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  sortOrder: number;
};

export type PlanWeek = {
  id: string;
  weekNumber: number;
  title: string | null;
  description: string | null;
  contents: PlanContent[];
  days: any[];
};

export type Plan = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  totalWeeks: number;
  isCustom: boolean;
  isDayWise: boolean;
  weeks: PlanWeek[];
};

export type DashboardResponse = {
  profile: {
    id: string;
    userId: string;
    planId: string | null;
    startDate: string | null;
    currentWeek: number;
    followupAccessToken: string | null;
    user: { name: string; username: string };
    plan: Plan | null;
  };
};

export function getDashboard() {
  return apiFetch<DashboardResponse>('/api/patient/dashboard');
}

export type GateStatus = {
  lifestyle: {
    requested: boolean;
    submitted: boolean;
    pending: boolean;
    blocked: boolean;
  };
  followup: {
    hasCarePlan: boolean;
    compulsory: boolean;
    pendingWeeks: number[];
    nextDueWeek: number | null;
    submittedWeeks: number[];
    blocked: boolean;
    showPrompt: boolean;
    formLink: string;
    patientName: string;
    planTitle: string;
  };
  assignedPlans: Array<{ href: string; title: string; program: string }>;
  blocked: boolean;
  blockType: string | null;
  redirectTo: string | null;
  blockMessage: string | null;
  patientName: string;
};

export function getGateStatus() {
  return apiFetch<GateStatus>('/api/patient/gate-status');
}

export function getLifestyleStatus() {
  return apiFetch<{
    pending: boolean;
    submitted?: boolean;
    patientName: string;
    requestedAt?: string;
  }>('/api/patient/lifestyle-assessment');
}

export function submitLifestyleAssessment(payload: Record<string, unknown>) {
  return apiFetch('/api/patient/lifestyle-assessment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getFollowupForWeek(week: number) {
  return apiFetch<{ followup: any }>(`/api/patient/followup?week=${week}`);
}

export function getFollowupStatus() {
  return apiFetch<GateStatus['followup']>('/api/patient/followup/status');
}

export type FollowupPayload = {
  weekNumber: number;
  currentWeight: string;
  exerciseDays: string;
  lowWaterDays: string;
  shortSleepDays: string;
  missedSupplementDays: string;
  mealsDeviated: string;
  planFeedback: string;
  feedbackLikedNotes: string;
  feedbackDislikedNotes: string;
  feedbackBadNotes: string;
  feedbackGoodNotes: string;
};

export function submitFollowup(payload: FollowupPayload) {
  return apiFetch('/api/patient/followup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
