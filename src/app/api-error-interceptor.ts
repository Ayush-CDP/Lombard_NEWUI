import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MSG_SERVICE_UNAVAILABLE, MSG_TOO_MANY_REQUESTS, isHtmlBody } from '../Shared/http-error';

/**
 * Normalises API error bodies for every screen:
 * - 429 (rate limit, empty body): gives the error a fixed "Too many requests" message.
 *   It never retries: retrying would only extend the block.
 * - HTML bodies (an IIS error page instead of the API): replaced by a generic message,
 *   so no screen ever shows raw HTML.
 * Status, headers and URL are kept, so other interceptors and screens still see them.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }
      let message: string | null = null;
      if (err.status === 429) {
        message = MSG_TOO_MANY_REQUESTS;
      } else if (isHtmlBody(err.error)) {
        message = MSG_SERVICE_UNAVAILABLE;
      }
      if (!message) {
        return throwError(() => err);
      }
      return throwError(
        () =>
          new HttpErrorResponse({
            error: { success: false, message, data: null },
            headers: err.headers,
            status: err.status,
            statusText: err.statusText,
            url: err.url ?? undefined,
          })
      );
    })
  );
