/** Fixed texts for responses whose body must not (or cannot) be shown. */
export const MSG_NO_ACCESS = 'You do not have access to this feature.';
export const MSG_TOO_MANY_REQUESTS = 'Too many requests. Please wait a few minutes and try again.';
export const MSG_SERVICE_UNAVAILABLE = 'Service temporarily unavailable. Please try again later.';

/** True for an HTML page (e.g. an IIS error page) instead of an API body. */
export function isHtmlBody(body: unknown): boolean {
  return typeof body === 'string' && body.trimStart().startsWith('<');
}

/**
 * Pulls a user-facing message out of an HttpErrorResponse.
 * Only plain text from the API is used: `message` / `Message` from the
 * `{ success, message, data }` envelope, ASP.NET validation errors, or
 * ProblemDetails `detail` / `title`. HTML bodies and 429s get a fixed text.
 * The result is meant for text interpolation only (never innerHTML).
 */
export function getApiErrorMessage(err: any, fallback: string): string {
  if (err?.status === 429) {
    return MSG_TOO_MANY_REQUESTS;
  }

  const body = err?.error;

  if (typeof body === 'string') {
    const text = body.trim();
    if (!text) {
      return fallback;
    }
    if (isHtmlBody(text)) {
      return MSG_SERVICE_UNAVAILABLE;
    }
    // Text responses (responseType: 'text') may still carry a JSON envelope.
    try {
      return getApiErrorMessage({ error: JSON.parse(text) }, fallback);
    } catch {
      return text;
    }
  }

  if (body && typeof body === 'object') {
    for (const key of ['message', 'Message']) {
      const v = body[key];
      if (typeof v === 'string' && v.trim()) {
        return v.trim();
      }
    }
    if (body.errors && typeof body.errors === 'object') {
      const msgs = Object.values(body.errors)
        .flat()
        .filter((m): m is string => typeof m === 'string' && m.trim().length > 0);
      if (msgs.length) {
        return msgs.join(' | ');
      }
    }
    for (const key of ['detail', 'title']) {
      const v = body[key];
      if (typeof v === 'string' && v.trim()) {
        return v.trim();
      }
    }
  }

  return fallback;
}

/**
 * Same as getApiErrorMessage, but a 403 always shows MSG_NO_ACCESS.
 * Used by role-protected screens (Group Membership, Rights Management),
 * where the API answers 403 with an empty body.
 */
export function getFeatureErrorMessage(err: any, fallback: string): string {
  return err?.status === 403 ? MSG_NO_ACCESS : getApiErrorMessage(err, fallback);
}
