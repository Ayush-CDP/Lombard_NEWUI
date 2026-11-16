/**
 * Remembers which in-app URL the user asked for before a Microsoft login
 * redirect, so they can be sent back there (e.g. /approval?id=...) instead
 * of always landing on the dashboard.
 *
 * Only safe internal paths are ever stored or returned (open-redirect guard).
 */
const KEY = 'postLoginRedirect';

/** Paths that must never be used as a post-login target (would loop). */
const BLOCKED_PREFIXES = ['/login'];

export function isSafeInternalPath(url: unknown): url is string {
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) {
    return false;
  }
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }
  if (url.includes('\\') || url.includes(':')) {
    return false;
  }
  // No control characters / whitespace tricks.
  if (/[\u0000-\u001F\u007F\s]/.test(url)) {
    return false;
  }
  const path = url.split(/[?#]/)[0].toLowerCase();
  if (path === '/' || BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    return false;
  }
  return true;
}

export function savePostLoginRedirect(url: string): void {
  if (!isSafeInternalPath(url)) {
    return;
  }
  try {
    sessionStorage.setItem(KEY, url);
  } catch {
    // Storage unavailable (private mode / blocked): fall back to the dashboard.
  }
}

/** Reads and clears the saved target. Returns null if missing or unsafe. */
export function consumePostLoginRedirect(): string | null {
  let value: string | null = null;
  try {
    value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    return null;
  }
  return isSafeInternalPath(value) ? value : null;
}

export function clearPostLoginRedirect(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
