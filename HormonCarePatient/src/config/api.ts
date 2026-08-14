import { NativeModules, Platform } from 'react-native';

const PRODUCTION_API = 'https://hormoncare.mediiqr.com';
const DEV_API_PORT = 3001;

/**
 * Laptop IP when testing on a physical phone (same WiFi as Metro).
 * `npm run dev` in the hormon_care root prints this under "Phone:".
 */
const FALLBACK_DEV_HOST = '192.168.1.4';

/** Set true to hit the live server while debugging (needs phone internet). */
const USE_PRODUCTION_IN_DEV = false;

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
  // Physical Android + USB: `adb reverse tcp:3001 tcp:3001` maps device
  // localhost → laptop. Cleartext is already allowed for localhost.
  if (Platform.OS === 'android') {
    return 'localhost';
  }

  const metroHost = getMetroHostname();
  if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
    return metroHost;
  }
  return 'localhost';
}

/**
 * API base URL.
 * - Release APK always uses live server.
 * - Debug uses local laptop unless USE_PRODUCTION_IN_DEV is true.
 */
export function resolveApiBaseUrl(): string {
  if (!__DEV__ || USE_PRODUCTION_IN_DEV) {
    return PRODUCTION_API;
  }
  return `http://${getDevApiHost()}:${DEV_API_PORT}`;
}

export const BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log('[JEEVANM] API base URL:', BASE_URL);
}
