type RateWindow = { count: number; resetsAt: number };

const windows = new Map<string, RateWindow>();

export function consumeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = windows.get(key);
  if (!current || current.resetsAt <= now) {
    windows.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 };
}

export function clearRateLimitsForTests() {
  windows.clear();
}
