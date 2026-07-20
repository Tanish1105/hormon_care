import { NativeModules, Platform } from 'react-native';

const PRODUCTION_API = 'https://hormoncare.mediiqr.com';
const DEV_API_PORT = 3001;

/**
 * Laptop IP when testing on a physical phone (same WiFi as Metro).
 * `npm run dev` in the hormon_care root prints this under "Phone:".
 */
const FALLBACK_DEV_HOST = '192.168.0.102';

/** Set true to hit the live server while debugging (needs phone internet). */
const USE_PRODUCTION_IN_DEV = true;

function getMetroHostname(): string | null {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) return null;
  try {
    return new URL(scriptURL).hostname;
  } catch {
    return null;
  }
}

function getDevApiHost(): string {
  const metroHost = getMetroHostname();
  if (metroHost) {
    if (metroHost !== 'localhost') return metroHost;
    // USB debugging: adb reverse tcp:3000 tcp:3000
    return 'localhost';
  }
  if (Platform.OS === 'android') {
    return FALLBACK_DEV_HOST;
  }
  return 'localhost';
}

export function resolveApiBaseUrl(): string {
  if (!__DEV__ || USE_PRODUCTION_IN_DEV) {
    return PRODUCTION_API;
  }
  return `http://${getDevApiHost()}:${DEV_API_PORT}`;
}

export const BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log('[HormonCare] API base URL:', BASE_URL);
}
