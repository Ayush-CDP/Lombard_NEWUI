/**
 * Pulls a user-facing message out of an HttpErrorResponse.
 * Handles the API's `{ success, message, data }` envelope, plain-text bodies,
 * and ASP.NET model-validation responses (`{ title, errors: { field: [..] } }`).
 */
export function getApiErrorMessage(err: any, fallback: string): string {
  const body = err?.error;

  if (typeof body === 'string') {
    const text = body.trim();
    if (!text) {
      return fallback;
    }
    // Text responses (responseType: 'text') may still carry a JSON envelope.
    try {
      return getApiErrorMessage({ error: JSON.parse(text) }, fallback);
    } catch {
      return text;
    }
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (body.errors && typeof body.errors === 'object') {
      const msgs = Object.values(body.errors)
        .flat()
        .filter((m): m is string => typeof m === 'string' && m.trim().length > 0);
      if (msgs.length) {
        return msgs.join(' | ');
      }
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      return body.title;
    }
  }

  return fallback;
}
