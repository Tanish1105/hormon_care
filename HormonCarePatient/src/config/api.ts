const PRODUCTION_API = 'https://hormoncare.mediiqr.com';

/** Always the live site on iPhone — LAN/localhost URLs fail off the laptop WiFi. */
export function resolveApiBaseUrl(): string {
  return PRODUCTION_API;
}

export const BASE_URL = PRODUCTION_API;
