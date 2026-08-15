const PRODUCTION_API = 'https://hormoncare.mediiqr.com';

/** Always the live site. Laptop/Metro proxy URLs fail on a physical iPhone. */
export function resolveApiBaseUrl(): string {
  return PRODUCTION_API;
}

export const BASE_URL = PRODUCTION_API;
