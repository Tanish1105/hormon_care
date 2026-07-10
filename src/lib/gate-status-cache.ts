const GATE_CACHE_TTL_MS = 45_000;

type GateCacheEntry = {
  data: unknown;
  at: number;
};

let gateCache: GateCacheEntry | null = null;

export function readGateStatusCache<T>(): T | null {
  if (!gateCache || Date.now() - gateCache.at >= GATE_CACHE_TTL_MS) return null;
  return gateCache.data as T;
}

export function writeGateStatusCache<T>(data: T) {
  gateCache = { data, at: Date.now() };
}

export function invalidateGateStatusCache() {
  gateCache = null;
}
