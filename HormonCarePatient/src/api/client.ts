/**
 * HTTP client for the JEEVANM patient backend.
 *
 * The upstream Next.js backend at https://hormoncare.mediiqr.com issues an HttpOnly
 * session cookie on login. React Native's fetch does NOT automatically persist
 * cookies between app launches, so we manage the raw `Set-Cookie` header ourselves
 * and re-send it via the `Cookie` request header on every subsequent call.
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@preeternal/react-native-cookie-manager';
import { BASE_URL, resolveApiBaseUrl } from '../config/api';

export { BASE_URL, resolveApiBaseUrl };

const COOKIE_KEY = 'hc.sessionCookie';
const USER_KEY = 'hc.user';
const REQUEST_TIMEOUT_MS = 20_000;

let cachedCookie: string | null = null;

export async function loadSession(): Promise<string | null> {
  if (cachedCookie) return cachedCookie;
  cachedCookie = await AsyncStorage.getItem(COOKIE_KEY);
  return cachedCookie;
}

function tokenFromSession(cookie: string | null): string | null {
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/i);
  return match ? match[1] : cookie;
}

async function syncNativeCookie(cookie: string | null) {
  const base = resolveApiBaseUrl();
  try {
    if (!cookie) {
      await CookieManager.clearAll(false);
      return;
    }
    const token = tokenFromSession(cookie);
    if (!token) return;
    const url = new URL(base);
    await CookieManager.set(
      base,
      {
        name: 'session',
        value: token,
        path: '/',
        domain: url.hostname,
        secure: url.protocol === 'https:',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      false,
    );
  } catch {
    /* iOS still has Authorization + Cookie headers as fallback */
  }
}

export async function saveSession(cookie: string): Promise<void> {
  cachedCookie = cookie;
  await AsyncStorage.setItem(COOKIE_KEY, cookie);
  await syncNativeCookie(cookie);
}

export async function clearSession(): Promise<void> {
  cachedCookie = null;
  await AsyncStorage.multiRemove([COOKIE_KEY, USER_KEY]);
  await syncNativeCookie(null);
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

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('network request failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error')
  );
}

type NativeHttpResult = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${resolveApiBaseUrl()}${path}`;
  const method = (init.method || 'GET').toUpperCase();
  const headers = (init.headers || {}) as Record<string, string>;
  const body =
    typeof init.body === 'string' || init.body == null
      ? (init.body as string | null)
      : String(init.body);

  const native = NativeModules.JeevanmHttp as
    | { request: (u: string, m: string, h: Record<string, string>, b: string) => Promise<NativeHttpResult> }
    | undefined;

  if (Platform.OS === 'ios' && native?.request) {
    return native
      .request(url, method, headers, body ?? '')
      .then(result => {
        const mapped = new Headers();
        Object.entries(result.headers || {}).forEach(([key, value]) => {
          mapped.append(key, value);
        });
        return new Response(result.body, {
          status: result.status,
          headers: mapped,
        });
      })
      .catch(() => {
        throw {
          status: 0,
          message: 'NETWORK_ERROR',
        } as ApiError;
      });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;
    xhr.timeout = REQUEST_TIMEOUT_MS;
    Object.entries(headers).forEach(([key, value]) => {
      try {
        xhr.setRequestHeader(key, value);
      } catch {
        /* iOS may block Cookie; Authorization still goes through */
      }
    });
    xhr.onload = () => {
      const raw = xhr.getAllResponseHeaders();
      const mapped = new Headers();
      raw
        .trim()
        .split(/[\r\n]+/)
        .forEach(line => {
          const idx = line.indexOf(':');
          if (idx > 0) {
            mapped.append(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
          }
        });
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          headers: mapped,
        }),
      );
    };
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
    };
    xhr.send(body);
  }).catch(error => {
    if (
      (error instanceof Error && error.name === 'AbortError') ||
      isNetworkError(error)
    ) {
      throw {
        status: 0,
        message: 'NETWORK_ERROR',
      } as ApiError;
    }
    throw error;
  });
}

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
  if (cookie) {
    headers.Cookie = cookie;
    const token = tokenFromSession(cookie);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['X-Session-Token'] = token;
    }
  }

  const res = await request(path, { ...init, headers });

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
  const res = await request('/api/auth/patient/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const setCookie =
    // @ts-ignore
    (typeof res.headers.get === 'function' && res.headers.get('set-cookie')) ||
    null;
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  const session = extractSessionCookie(setCookie);
  if (!res.ok) {
    throw { status: res.status, message: json?.error || 'Login failed' } as ApiError;
  }
  if (session) {
    await saveSession(session);
  } else if (json?.token) {
    await saveSession(`session=${json.token}`);
  } else {
    throw {
      status: 0,
      message: 'SESSION_SETUP_FAILED',
    } as ApiError;
  }
  if (!json?.user) {
    throw { status: 0, message: 'Login failed' } as ApiError;
  }
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
  section?: 'RECIPE' | 'EXERCISE' | 'MEDITATION' | string | null;
  type: 'YOUTUBE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | string;
  title: string | null;
  description: string | null;
  url: string | null;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  sortOrder: number;
};

export type PlanDay = {
  id: string;
  dayNumber: number;
  title: string | null;
  description: string | null;
  contents: PlanContent[];
};

export type PlanWeek = {
  id: string;
  weekNumber: number;
  title: string | null;
  description: string | null;
  contents: PlanContent[];
  days: PlanDay[];
};

export type PlanProgram = 'care' | 'garbha' | 'child';

export type Plan = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl?: string | null;
  totalWeeks: number;
  isCustom: boolean;
  isDayWise: boolean;
  weeks: PlanWeek[];
};

export type SupplementItem = {
  id: string;
  name: string;
  time: string;
  quantity: string;
  notes: string | null;
  sortOrder?: number;
};

export type SupplementPlan = {
  id: string;
  title: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  items: SupplementItem[];
};

export type DashboardResponse = {
  profile: {
    id: string;
    userId: string;
    planId: string | null;
    garbhaPlanId?: string | null;
    childGuidancePlanId?: string | null;
    startDate: string | null;
    garbhaStartDate?: string | null;
    childGuidanceStartDate?: string | null;
    currentWeek: number;
    garbhaCurrentWeek?: number;
    childGuidanceCurrentWeek?: number;
    followupAccessToken: string | null;
    user: { name: string; username: string };
    plan: Plan | null;
    garbhaPlan?: Plan | null;
    childGuidancePlan?: Plan | null;
    supplementPlans?: SupplementPlan[];
  };
  unlockedWeek: number;
  garbhaUnlockedWeek?: number;
  childGuidanceUnlockedWeek?: number;
  unlockedDay?: number;
  garbhaUnlockedDay?: number;
  childGuidanceUnlockedDay?: number;
};

export type AssignedProgram = {
  program: PlanProgram;
  plan: Plan;
  unlockedWeek: number;
  unlockedDay: number;
  startDate: string | null;
  youtubeSource: 'plan' | 'garbha' | 'child-guidance';
};

export function youtubeSourceFor(
  program: PlanProgram,
): 'plan' | 'garbha' | 'child-guidance' {
  if (program === 'garbha') return 'garbha';
  if (program === 'child') return 'child-guidance';
  return 'plan';
}

export function getAssignedPrograms(
  dashboard: DashboardResponse | null | undefined,
): AssignedProgram[] {
  if (!dashboard?.profile) return [];
  const list: AssignedProgram[] = [];
  const { profile } = dashboard;

  if (profile.plan) {
    list.push({
      program: 'care',
      plan: profile.plan,
      unlockedWeek:
        dashboard.unlockedWeek ?? profile.currentWeek ?? 0,
      unlockedDay: dashboard.unlockedDay ?? 7,
      startDate: profile.startDate ?? null,
      youtubeSource: 'plan',
    });
  }
  if (profile.garbhaPlan) {
    list.push({
      program: 'garbha',
      plan: profile.garbhaPlan,
      unlockedWeek:
        dashboard.garbhaUnlockedWeek ?? profile.currentWeek ?? 0,
      unlockedDay: dashboard.garbhaUnlockedDay ?? 7,
      startDate: profile.garbhaStartDate ?? profile.startDate ?? null,
      youtubeSource: 'garbha',
    });
  }
  if (profile.childGuidancePlan) {
    list.push({
      program: 'child',
      plan: profile.childGuidancePlan,
      unlockedWeek:
        dashboard.childGuidanceUnlockedWeek ?? profile.currentWeek ?? 0,
      unlockedDay: dashboard.childGuidanceUnlockedDay ?? 7,
      startDate:
        profile.childGuidanceStartDate ?? profile.startDate ?? null,
      youtubeSource: 'child-guidance',
    });
  }
  return list;
}

export function getProgramFromDashboard(
  dashboard: DashboardResponse | null | undefined,
  program: PlanProgram = 'care',
): AssignedProgram | null {
  return (
    getAssignedPrograms(dashboard).find(p => p.program === program) ?? null
  );
}

/**
 * Uploads are stored as `/uploads/...` or `/api/media/...` relative paths.
 * React Native Image needs an absolute URL.
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Legacy `/uploads/x` → serve via API media route when possible
  let path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const uploadMatch = path.match(/^\/uploads\/([^/?#]+)$/i);
  if (uploadMatch) {
    path = `/api/media/${uploadMatch[1]}`;
  }

  const absolute = `${resolveApiBaseUrl()}${path}`;
  try {
    return encodeURI(decodeURI(absolute));
  } catch {
    return absolute;
  }
}

/** Secure YouTube player page (session cookie required in WebView headers). */
export function youtubeEmbedPageUrl(
  contentId: string,
  source: 'plan' | 'garbha' | 'child-guidance' = 'plan',
): string {
  return `${resolveApiBaseUrl()}/api/patient/youtube-embed/${contentId}?source=${source}`;
}

export function youtubeThumbUrl(
  contentId: string,
  source: 'plan' | 'garbha' | 'child-guidance' = 'plan',
): string {
  return `${resolveApiBaseUrl()}/api/patient/youtube-thumb/${contentId}?source=${source}`;
}

/** Count contents for week-wise or day-wise plans. */
export function countWeekContents(week: PlanWeek, isDayWise?: boolean): number {
  if (isDayWise && week.days?.length) {
    return week.days.reduce((sum, d) => sum + (d.contents?.length || 0), 0);
  }
  return week.contents?.length || 0;
}

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

export type FollowupDelta = {
  delta: number;
  direction: 'up' | 'down' | 'same';
} | null;

export type FollowupHistoryWeek = {
  id: string;
  weekNumber: number;
  currentWeight: number;
  exerciseDays: number;
  lowWaterDays: number;
  shortSleepDays: number;
  missedSupplementDays: number;
  mealsDeviated: string | null;
  planFeedback: string | null;
  feedbackLikedNotes: string | null;
  feedbackDislikedNotes: string | null;
  feedbackBadNotes: string | null;
  feedbackGoodNotes: string | null;
  waist: number | null;
  chest: number | null;
  thigh: number | null;
  hip: number | null;
  arm: number | null;
  neck: number | null;
  submittedAt: string;
  comparison: {
    weight: FollowupDelta;
    waist: FollowupDelta;
    chest: FollowupDelta;
    thigh: FollowupDelta;
    hip: FollowupDelta;
    arm: FollowupDelta;
    neck: FollowupDelta;
    exerciseDays: FollowupDelta;
    lowWaterDays: FollowupDelta;
    shortSleepDays: FollowupDelta;
    missedSupplementDays: FollowupDelta;
  };
};

export type FollowupHistory = {
  planTitle: string;
  totalWeeks: number;
  submissionCount: number;
  latestWeight: number | null;
  firstWeight: number | null;
  weightChange: number | null;
  followups: FollowupHistoryWeek[];
};

export function getFollowupHistory() {
  return apiFetch<FollowupHistory>('/api/patient/followup/history');
}

export type SupplementsResponse = {
  plans: SupplementPlan[];
  activePlan: SupplementPlan | null;
};

function supplementsFromDashboard(
  dashboard: DashboardResponse | null | undefined,
): SupplementsResponse {
  const plans = dashboard?.profile?.supplementPlans ?? [];
  return {
    plans,
    activePlan: plans.find(plan => plan.isActive) ?? plans[0] ?? null,
  };
}

export async function getSupplements(): Promise<SupplementsResponse> {
  const [dedicated, dashboard] = await Promise.allSettled([
    apiFetch<SupplementsResponse>('/api/patient/supplements'),
    getDashboard(),
  ]);

  if (dedicated.status === 'fulfilled') {
    return dedicated.value;
  }
  if (dashboard.status === 'fulfilled') {
    return supplementsFromDashboard(dashboard.value);
  }
  throw dedicated.reason;
}

export function getActiveSupplementPlan(
  dashboard: DashboardResponse | null | undefined,
): SupplementPlan | null {
  return supplementsFromDashboard(dashboard).activePlan;
}
